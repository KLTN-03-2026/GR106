BEGIN;
SET LOCAL app.bypass_rls = 'true';
-- Thêm vào đầu file migration trước khi tạo bảng
CREATE OR REPLACE FUNCTION public.gen_uuidv7() RETURNS uuid
    LANGUAGE plpgsql AS $$
DECLARE
    v_unix_ms  bigint;
    v_rand_a   bigint;
    v_rand_b   bigint;
    v_hex      text;
BEGIN
    v_unix_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint;
    v_rand_a  := (random() * x'FFF'::bigint)::bigint;
    v_rand_b  := (random() * x'3FFFFFFFFFFFFFFF'::bigint)::bigint;

    v_hex := lpad(to_hex(v_unix_ms), 12, '0')
           || lpad(to_hex(v_rand_a), 3, '0')
           || '7'
           || lpad(to_hex(
                (v_rand_b & x'3FFFFFFFFFFFFFFF'::bigint)
                | x'8000000000000000'::bigint
              ), 16, '0');

    RETURN (
        substr(v_hex,  1,  8) || '-' ||
        substr(v_hex,  9,  4) || '-' ||
        substr(v_hex, 13,  4) || '-' ||
        substr(v_hex, 17,  4) || '-' ||
        substr(v_hex, 21, 12)
    )::uuid;
END;
$$;
-- =============================================================================
-- WORK SESSION SYSTEM
-- Thêm vào sau phần work_logs trong schema chính
-- =============================================================================

-- ── Work session policies (config auto-close theo farm) ───────────────────────

CREATE TABLE public.work_session_policies (
    id                    uuid      DEFAULT public.gen_uuidv7() NOT NULL PRIMARY KEY,
    farm_id               uuid      NOT NULL REFERENCES public.farms(id) UNIQUE,
    auto_close_enabled    boolean   DEFAULT true  NOT NULL,
    auto_close_time       time      DEFAULT '20:00' NOT NULL,
    max_session_hours     smallint  DEFAULT 12    NOT NULL,
    require_checkout_note boolean   DEFAULT false NOT NULL,
    allow_manual_checkout boolean   DEFAULT true  NOT NULL,  -- nhân công tự sửa giờ check-out
    created_at            timestamp DEFAULT now() NOT NULL,
    updated_at            timestamp,
    CONSTRAINT chk_max_hours CHECK (max_session_hours BETWEEN 1 AND 24)
);

CREATE TRIGGER trg_work_session_policies_updated_at
    BEFORE UPDATE ON public.work_session_policies
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ── Force action logs (lịch sử khoá cưỡng bức) ───────────────────────────────

CREATE TABLE public.force_action_logs (
    id                uuid        DEFAULT public.gen_uuidv7() NOT NULL PRIMARY KEY,
    farm_id           uuid        NOT NULL REFERENCES public.farms(id),
    target_type       varchar(10) NOT NULL,
    target_id         uuid        NOT NULL,
    action            varchar(20) NOT NULL,
    reason            text        NOT NULL,
    performed_by      uuid        NOT NULL REFERENCES public.users(id),
    performed_at      timestamp   DEFAULT now() NOT NULL,
    CONSTRAINT chk_target_type CHECK (target_type IN ('PLAN', 'STAGE', 'TASK')),
    CONSTRAINT chk_action      CHECK (action IN ('CANCEL', 'COMPLETE', 'LOCK'))
);

CREATE INDEX idx_force_action_farm   ON public.force_action_logs (farm_id, performed_at DESC);
CREATE INDEX idx_force_action_target ON public.force_action_logs (target_type, target_id);
-- ── Work sessions (check-in / check-out thực tế) ──────────────────────────────

CREATE TABLE public.work_sessions (
    id                  uuid      DEFAULT public.gen_uuidv7() NOT NULL PRIMARY KEY,
    task_id             uuid      NOT NULL REFERENCES public.tasks(id),
    work_log_id         uuid      REFERENCES public.work_logs(id),
    farm_id             uuid      NOT NULL REFERENCES public.farms(id),
    employee_id         uuid      NOT NULL REFERENCES public.users(id),
    checked_in_at       timestamp NOT NULL DEFAULT now(),
    checked_out_at      timestamp,
    check_in_note       text,
    check_out_note      text,
    -- Manual adjustment (nhân công quên check-out, sửa lại giờ)
    checked_out_at_original timestamp,  -- giá trị cũ trước khi sửa
    adjusted_by             uuid      REFERENCES public.users(id),
    adjusted_at             timestamp,
    adjust_reason           text,
    -- Force close: chỉ cần FK, mọi thông tin lấy từ force_action_logs
    force_action_log_id uuid REFERENCES public.force_action_logs(id),
    created_at          timestamp DEFAULT now() NOT NULL,
    CONSTRAINT chk_session_times CHECK (
        checked_out_at IS NULL OR checked_out_at > checked_in_at
    ),
    CONSTRAINT chk_adjust_consistent CHECK (
        (adjusted_by IS NULL) = (adjusted_at IS NULL)
            AND (adjusted_at IS NULL) = (checked_out_at_original IS NULL)
            AND (adjusted_at IS NULL) = (adjust_reason IS NULL)
    ),
    -- Có force_action_log thì session phải đã đóng
    CONSTRAINT chk_force_log_consistent CHECK (
        force_action_log_id IS NULL OR checked_out_at IS NOT NULL
    )
);

-- Mỗi nhân công chỉ có 1 session đang mở tại 1 thời điểm
CREATE UNIQUE INDEX idx_one_open_session_per_employee
    ON public.work_sessions (employee_id)
    WHERE checked_out_at IS NULL;

CREATE INDEX idx_work_sessions_task     ON public.work_sessions (task_id);
CREATE INDEX idx_work_sessions_farm     ON public.work_sessions (farm_id, checked_in_at DESC);
CREATE INDEX idx_work_sessions_employee ON public.work_sessions (employee_id, checked_in_at DESC);
CREATE INDEX idx_work_sessions_open     ON public.work_sessions (task_id)
    WHERE checked_out_at IS NULL;
CREATE INDEX idx_work_sessions_worklog  ON public.work_sessions (work_log_id)
    WHERE work_log_id IS NOT NULL;

-- ── Trigger: không cho lock work_log khi session chưa đóng ────────────────────

CREATE OR REPLACE FUNCTION public.fn_check_session_before_lock_worklog()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.locked_at IS NOT NULL AND OLD.locked_at IS NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.work_sessions
            WHERE work_log_id    = NEW.id
              AND checked_out_at IS NULL
        ) THEN
            RAISE EXCEPTION
                'Không thể khoá work log khi nhân công chưa check-out (work_log_id: %)',
                NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_session_before_lock
    BEFORE UPDATE ON public.work_logs
    FOR EACH ROW EXECUTE FUNCTION public.fn_check_session_before_lock_worklog();

-- ── Trigger: không cho xoá work_log đã có session ────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_protect_worklog_with_session()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.work_sessions
        WHERE work_log_id = OLD.id
    ) THEN
        RAISE EXCEPTION
            'Không thể xoá work log đã liên kết với session (work_log_id: %)',
            OLD.id;
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_protect_worklog_with_session
    BEFORE DELETE ON public.work_logs
    FOR EACH ROW EXECUTE FUNCTION public.fn_protect_worklog_with_session();

-- ── View: session đang mở kèm thông tin task và nhân công ────────────────────
-- ── RLS cho các bảng mới ──────────────────────────────────────────────────────

-- work_session_policies
ALTER TABLE public.work_session_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_session_policies_select ON public.work_session_policies
    FOR SELECT USING (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY work_session_policies_insert ON public.work_session_policies
    FOR INSERT WITH CHECK (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY work_session_policies_update ON public.work_session_policies
    FOR UPDATE USING (public.is_bypass_rls() OR farm_id = public.current_farm_id())
    WITH CHECK (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY work_session_policies_delete ON public.work_session_policies
    FOR DELETE USING (public.is_bypass_rls() OR farm_id = public.current_farm_id());

-- work_sessions
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_sessions_select ON public.work_sessions
    FOR SELECT USING (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY work_sessions_insert ON public.work_sessions
    FOR INSERT WITH CHECK (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY work_sessions_update ON public.work_sessions
    FOR UPDATE USING (public.is_bypass_rls() OR farm_id = public.current_farm_id())
    WITH CHECK (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY work_sessions_delete ON public.work_sessions
    FOR DELETE USING (public.is_bypass_rls());  -- chỉ bypass mới xoá được

-- force_action_logs
ALTER TABLE public.force_action_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY force_action_logs_select ON public.force_action_logs
    FOR SELECT USING (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY force_action_logs_insert ON public.force_action_logs
    FOR INSERT WITH CHECK (public.is_bypass_rls() OR farm_id = public.current_farm_id());
CREATE POLICY force_action_logs_update ON public.force_action_logs
    FOR UPDATE USING (false);  -- không cho sửa log
CREATE POLICY force_action_logs_delete ON public.force_action_logs
    FOR DELETE USING (false);  -- không cho xoá log

SET LOCAL app.bypass_rls = 'false';

COMMIT;

