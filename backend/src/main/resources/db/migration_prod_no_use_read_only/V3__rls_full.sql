-- ============================================================
-- ROW LEVEL SECURITY — v2 FIXED
-- ============================================================


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION current_farm_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_farm_id', TRUE)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', TRUE)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ============================================================
-- 1. FARMS — LOGIN-SAFE
-- ============================================================

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farms_select ON farms;
DROP POLICY IF EXISTS farms_insert ON farms;
DROP POLICY IF EXISTS farms_update ON farms;
DROP POLICY IF EXISTS farms_delete ON farms;
DROP POLICY IF EXISTS farms_modify ON farms;

CREATE POLICY farms_select ON farms
FOR SELECT
USING (
    owner_id = current_app_user_id()
    OR id IN (
        SELECT farm_id FROM farm_members
        WHERE user_id  = current_app_user_id()
          AND is_active = TRUE
    )
);

CREATE POLICY farms_insert ON farms
FOR INSERT
WITH CHECK (owner_id = current_app_user_id());

CREATE POLICY farms_update ON farms
FOR UPDATE
USING (owner_id = current_app_user_id())
WITH CHECK (owner_id = current_app_user_id());

CREATE POLICY farms_delete ON farms
FOR DELETE
USING (owner_id = current_app_user_id());


-- ============================================================
-- 2. FARM_MEMBERS — LOGIN-SAFE
-- ============================================================

ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farm_members_select ON farm_members;
DROP POLICY IF EXISTS farm_members_insert ON farm_members;
DROP POLICY IF EXISTS farm_members_update ON farm_members;
DROP POLICY IF EXISTS farm_members_delete ON farm_members;

CREATE POLICY farm_members_select ON farm_members
FOR SELECT
USING (
    -- Xem record của chính mình (login phase, chưa có farm_id)
    user_id = current_app_user_id()
    OR
    -- Xem tất cả member khi đã vào farm
    (current_farm_id() IS NOT NULL AND farm_id = current_farm_id())
);

CREATE POLICY farm_members_insert ON farm_members
FOR INSERT
WITH CHECK (farm_id = current_farm_id());

CREATE POLICY farm_members_update ON farm_members
FOR UPDATE
USING (farm_id = current_farm_id())
WITH CHECK (farm_id = current_farm_id());

CREATE POLICY farm_members_delete ON farm_members
FOR DELETE
USING (farm_id = current_farm_id());


-- ============================================================
-- 3. FARM_SUBSCRIPTIONS
-- ============================================================

ALTER TABLE farm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farm_subscriptions_select ON farm_subscriptions;
DROP POLICY IF EXISTS farm_subscriptions_insert ON farm_subscriptions;
DROP POLICY IF EXISTS farm_subscriptions_update ON farm_subscriptions;
DROP POLICY IF EXISTS farm_subscriptions_delete ON farm_subscriptions;

CREATE POLICY farm_subscriptions_select ON farm_subscriptions
FOR SELECT USING (farm_id = current_farm_id());

CREATE POLICY farm_subscriptions_insert ON farm_subscriptions
FOR INSERT
WITH CHECK (
    farm_id = current_farm_id()
    AND EXISTS (
        SELECT 1 FROM farms f
        WHERE f.id = farm_id
          AND (
              f.owner_id = current_app_user_id()
              OR EXISTS (
                  SELECT 1 FROM farm_members fm
                  WHERE fm.farm_id = f.id
                    AND fm.user_id  = current_app_user_id()
                    AND fm.is_active = TRUE
              )
          )
    )
);

CREATE POLICY farm_subscriptions_update ON farm_subscriptions
FOR UPDATE
USING (farm_id = current_farm_id())
WITH CHECK (farm_id = current_farm_id());

CREATE POLICY farm_subscriptions_delete ON farm_subscriptions
FOR DELETE USING (farm_id = current_farm_id());


-- ============================================================
-- 4. SUBSCRIPTION_HISTORY
-- DELETE bị block hoàn toàn (audit trail)
-- ============================================================

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscription_history_select ON subscription_history;
DROP POLICY IF EXISTS subscription_history_insert ON subscription_history;
DROP POLICY IF EXISTS subscription_history_update ON subscription_history;
DROP POLICY IF EXISTS subscription_history_delete ON subscription_history;

CREATE POLICY subscription_history_select ON subscription_history
FOR SELECT USING (farm_id = current_farm_id());

CREATE POLICY subscription_history_insert ON subscription_history
FOR INSERT
WITH CHECK (
    farm_id = current_farm_id()
    AND EXISTS (
        SELECT 1 FROM farms f
        WHERE f.id = farm_id
          AND (
              f.owner_id = current_app_user_id()
              OR EXISTS (
                  SELECT 1 FROM farm_members fm
                  WHERE fm.farm_id = f.id
                    AND fm.user_id  = current_app_user_id()
                    AND fm.is_active = TRUE
              )
          )
    )
);

CREATE POLICY subscription_history_update ON subscription_history
FOR UPDATE
USING (farm_id = current_farm_id())
WITH CHECK (farm_id = current_farm_id());

CREATE POLICY subscription_history_delete ON subscription_history
FOR DELETE USING (FALSE);


-- ============================================================
-- 5. NOTIFICATIONS — user-scoped + optional farm-scoped
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select ON notifications;
DROP POLICY IF EXISTS notifications_insert ON notifications;
DROP POLICY IF EXISTS notifications_update ON notifications;
DROP POLICY IF EXISTS notifications_delete ON notifications;
DROP POLICY IF EXISTS notifications_iso    ON notifications;

CREATE POLICY notifications_select ON notifications
FOR SELECT
USING (
    user_id = current_app_user_id()
    AND (
        farm_id IS NULL
        OR current_farm_id() IS NULL
        OR farm_id = current_farm_id()
    )
);

CREATE POLICY notifications_insert ON notifications
FOR INSERT
WITH CHECK (
    user_id = current_app_user_id()
    OR farm_id = current_farm_id()
);

CREATE POLICY notifications_update ON notifications
FOR UPDATE
USING (user_id = current_app_user_id())
WITH CHECK (user_id = current_app_user_id());

CREATE POLICY notifications_delete ON notifications
FOR DELETE USING (user_id = current_app_user_id());


-- ============================================================
-- 6. CROPS — SYSTEM (public read) + FARM (private)
-- ============================================================

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crops_visibility ON crops;
DROP POLICY IF EXISTS crops_modify     ON crops;
DROP POLICY IF EXISTS crops_select     ON crops;
DROP POLICY IF EXISTS crops_insert     ON crops;
DROP POLICY IF EXISTS crops_update     ON crops;
DROP POLICY IF EXISTS crops_delete     ON crops;

CREATE POLICY crops_select ON crops
FOR SELECT
USING (
    scope = 'SYSTEM'
    OR (scope = 'FARM' AND farm_id = current_farm_id())
);

CREATE POLICY crops_insert ON crops
FOR INSERT
WITH CHECK (scope = 'FARM' AND farm_id = current_farm_id());

CREATE POLICY crops_update ON crops
FOR UPDATE
USING (scope = 'FARM' AND farm_id = current_farm_id())
WITH CHECK (scope = 'FARM' AND farm_id = current_farm_id());

CREATE POLICY crops_delete ON crops
FOR DELETE
USING (scope = 'FARM' AND farm_id = current_farm_id());


-- ============================================================
-- 7. AUDIT_LOGS — read-only, INSERT qua SECURITY DEFINER
-- ============================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_iso    ON audit_logs;
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
DROP POLICY IF EXISTS audit_logs_update ON audit_logs;
DROP POLICY IF EXISTS audit_logs_delete ON audit_logs;

CREATE POLICY audit_logs_select ON audit_logs
FOR SELECT
USING (farm_id = current_farm_id() OR farm_id IS NULL);

CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (FALSE);
CREATE POLICY audit_logs_update ON audit_logs FOR UPDATE USING (FALSE);
CREATE POLICY audit_logs_delete ON audit_logs FOR DELETE USING (FALSE);


-- ============================================================
-- 8. PLAN_STAGE_STATUS_TRANSITIONS — global + farm override
-- ============================================================

ALTER TABLE plan_stage_status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_stage_status_transitions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_stage_status_transitions_iso ON plan_stage_status_transitions;
DROP POLICY IF EXISTS psst_visibility ON plan_stage_status_transitions;
DROP POLICY IF EXISTS psst_modify     ON plan_stage_status_transitions;
DROP POLICY IF EXISTS psst_select     ON plan_stage_status_transitions;
DROP POLICY IF EXISTS psst_insert     ON plan_stage_status_transitions;
DROP POLICY IF EXISTS psst_update     ON plan_stage_status_transitions;
DROP POLICY IF EXISTS psst_delete     ON plan_stage_status_transitions;

CREATE POLICY psst_select ON plan_stage_status_transitions
FOR SELECT
USING (farm_id IS NULL OR farm_id = current_farm_id());

CREATE POLICY psst_insert ON plan_stage_status_transitions
FOR INSERT WITH CHECK (farm_id = current_farm_id());

CREATE POLICY psst_update ON plan_stage_status_transitions
FOR UPDATE
USING (farm_id = current_farm_id())
WITH CHECK (farm_id = current_farm_id());

CREATE POLICY psst_delete ON plan_stage_status_transitions
FOR DELETE USING (farm_id = current_farm_id());


-- ============================================================
-- 9. TASK_STATUS_TRANSITIONS — global + farm override
-- ============================================================

ALTER TABLE task_status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_transitions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_status_transitions_iso ON task_status_transitions;
DROP POLICY IF EXISTS tst_visibility ON task_status_transitions;
DROP POLICY IF EXISTS tst_modify     ON task_status_transitions;
DROP POLICY IF EXISTS tst_select     ON task_status_transitions;
DROP POLICY IF EXISTS tst_insert     ON task_status_transitions;
DROP POLICY IF EXISTS tst_update     ON task_status_transitions;
DROP POLICY IF EXISTS tst_delete     ON task_status_transitions;

CREATE POLICY tst_select ON task_status_transitions
FOR SELECT
USING (farm_id IS NULL OR farm_id = current_farm_id());

CREATE POLICY tst_insert ON task_status_transitions
FOR INSERT WITH CHECK (farm_id = current_farm_id());

CREATE POLICY tst_update ON task_status_transitions
FOR UPDATE
USING (farm_id = current_farm_id())
WITH CHECK (farm_id = current_farm_id());

CREATE POLICY tst_delete ON task_status_transitions
FOR DELETE USING (farm_id = current_farm_id());


-- ============================================================
-- 10. CÁC BẢNG CÓ farm_id TRỰC TIẾP — STRICT
-- Chỉ gồm bảng ĐÃ XÁC NHẬN có cột farm_id
-- ============================================================

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'farm_configs',
    'invitations',
    'payment_transactions',
    'plots',
    'soil_records',
    'soil_ai_results',
    'plans',
    'plan_plots',
    'plan_stage_status_histories',
    'tasks',
    'work_logs',
    'work_shifts',
    'warehouses',
    'warehouse_locations',
    'warehouse_items',
    'warehouse_stock',
    'warehouse_transactions',
    'harvest_records',
    'harvest_images',
    'diagnoses',
    'disease_reports',
    'employee_wage_configs'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_update ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_delete ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_iso    ON %I', tbl, tbl);

    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT USING (farm_id = current_farm_id())',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (farm_id = current_farm_id())',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE USING (farm_id = current_farm_id()) WITH CHECK (farm_id = current_farm_id())',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE USING (farm_id = current_farm_id())',
      tbl, tbl
    );
  END LOOP;
END $$;


-- ============================================================
-- 11. BẢNG KHÔNG CÓ farm_id — follow parent table
-- ============================================================

-- ── plan_stages → plans.farm_id ─────────────────────────────
ALTER TABLE plan_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_stages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_stages_iso    ON plan_stages;
DROP POLICY IF EXISTS plan_stages_select ON plan_stages;
DROP POLICY IF EXISTS plan_stages_insert ON plan_stages;
DROP POLICY IF EXISTS plan_stages_update ON plan_stages;
DROP POLICY IF EXISTS plan_stages_delete ON plan_stages;

CREATE POLICY plan_stages_select ON plan_stages FOR SELECT
USING (plan_id IN (SELECT id FROM plans WHERE farm_id = current_farm_id()));

CREATE POLICY plan_stages_insert ON plan_stages FOR INSERT
WITH CHECK (plan_id IN (SELECT id FROM plans WHERE farm_id = current_farm_id()));

CREATE POLICY plan_stages_update ON plan_stages FOR UPDATE
USING (plan_id IN (SELECT id FROM plans WHERE farm_id = current_farm_id()));

CREATE POLICY plan_stages_delete ON plan_stages FOR DELETE
USING (plan_id IN (SELECT id FROM plans WHERE farm_id = current_farm_id()));


-- ── task_status_histories → tasks.farm_id ───────────────────
ALTER TABLE task_status_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_histories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tsh_iso                     ON task_status_histories;
DROP POLICY IF EXISTS task_status_histories_select ON task_status_histories;
DROP POLICY IF EXISTS task_status_histories_insert ON task_status_histories;
DROP POLICY IF EXISTS task_status_histories_update ON task_status_histories;
DROP POLICY IF EXISTS task_status_histories_delete ON task_status_histories;

CREATE POLICY task_status_histories_select ON task_status_histories FOR SELECT
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_status_histories_insert ON task_status_histories FOR INSERT
WITH CHECK (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

-- Immutable audit trail
CREATE POLICY task_status_histories_update ON task_status_histories FOR UPDATE USING (FALSE);
CREATE POLICY task_status_histories_delete ON task_status_histories FOR DELETE USING (FALSE);


-- ── task_dependencies → tasks.farm_id ───────────────────────
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_deps_iso    ON task_dependencies;
DROP POLICY IF EXISTS task_deps_select ON task_dependencies;
DROP POLICY IF EXISTS task_deps_insert ON task_dependencies;
DROP POLICY IF EXISTS task_deps_update ON task_dependencies;
DROP POLICY IF EXISTS task_deps_delete ON task_dependencies;

CREATE POLICY task_deps_select ON task_dependencies FOR SELECT
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_deps_insert ON task_dependencies FOR INSERT
WITH CHECK (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_deps_update ON task_dependencies FOR UPDATE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_deps_delete ON task_dependencies FOR DELETE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));


-- ── task_assignees → tasks.farm_id ──────────────────────────
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_assignees_iso    ON task_assignees;
DROP POLICY IF EXISTS task_assignees_select ON task_assignees;
DROP POLICY IF EXISTS task_assignees_insert ON task_assignees;
DROP POLICY IF EXISTS task_assignees_update ON task_assignees;
DROP POLICY IF EXISTS task_assignees_delete ON task_assignees;

CREATE POLICY task_assignees_select ON task_assignees FOR SELECT
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_assignees_insert ON task_assignees FOR INSERT
WITH CHECK (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_assignees_update ON task_assignees FOR UPDATE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_assignees_delete ON task_assignees FOR DELETE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));


-- ── task_materials → tasks.farm_id ──────────────────────────
ALTER TABLE task_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_materials FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_materials_iso    ON task_materials;
DROP POLICY IF EXISTS task_materials_select ON task_materials;
DROP POLICY IF EXISTS task_materials_insert ON task_materials;
DROP POLICY IF EXISTS task_materials_update ON task_materials;
DROP POLICY IF EXISTS task_materials_delete ON task_materials;

CREATE POLICY task_materials_select ON task_materials FOR SELECT
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_materials_insert ON task_materials FOR INSERT
WITH CHECK (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_materials_update ON task_materials FOR UPDATE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_materials_delete ON task_materials FOR DELETE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));


-- ── task_skip_days → tasks.farm_id ──────────────────────────
ALTER TABLE task_skip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_skip_days FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_skip_days_iso    ON task_skip_days;
DROP POLICY IF EXISTS task_skip_days_select ON task_skip_days;
DROP POLICY IF EXISTS task_skip_days_insert ON task_skip_days;
DROP POLICY IF EXISTS task_skip_days_update ON task_skip_days;
DROP POLICY IF EXISTS task_skip_days_delete ON task_skip_days;

CREATE POLICY task_skip_days_select ON task_skip_days FOR SELECT
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_skip_days_insert ON task_skip_days FOR INSERT
WITH CHECK (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_skip_days_update ON task_skip_days FOR UPDATE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

CREATE POLICY task_skip_days_delete ON task_skip_days FOR DELETE
USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));


-- ── work_log_images → work_logs.farm_id ─────────────────────
ALTER TABLE work_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_images FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS work_log_images_iso    ON work_log_images;
DROP POLICY IF EXISTS work_log_images_select ON work_log_images;
DROP POLICY IF EXISTS work_log_images_insert ON work_log_images;
DROP POLICY IF EXISTS work_log_images_update ON work_log_images;
DROP POLICY IF EXISTS work_log_images_delete ON work_log_images;

CREATE POLICY work_log_images_select ON work_log_images FOR SELECT
USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

CREATE POLICY work_log_images_insert ON work_log_images FOR INSERT
WITH CHECK (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

CREATE POLICY work_log_images_update ON work_log_images FOR UPDATE
USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

CREATE POLICY work_log_images_delete ON work_log_images FOR DELETE
USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));


-- ── work_log_materials → work_logs.farm_id ──────────────────
ALTER TABLE work_log_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_materials FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS work_log_materials_iso    ON work_log_materials;
DROP POLICY IF EXISTS work_log_materials_select ON work_log_materials;
DROP POLICY IF EXISTS work_log_materials_insert ON work_log_materials;
DROP POLICY IF EXISTS work_log_materials_update ON work_log_materials;
DROP POLICY IF EXISTS work_log_materials_delete ON work_log_materials;

CREATE POLICY work_log_materials_select ON work_log_materials FOR SELECT
USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

CREATE POLICY work_log_materials_insert ON work_log_materials FOR INSERT
WITH CHECK (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

CREATE POLICY work_log_materials_update ON work_log_materials FOR UPDATE
USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

CREATE POLICY work_log_materials_delete ON work_log_materials FOR DELETE
USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));


-- ── diagnosis_images → diagnoses.farm_id ────────────────────
ALTER TABLE diagnosis_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_images FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diagnosis_images_iso    ON diagnosis_images;
DROP POLICY IF EXISTS diagnosis_images_select ON diagnosis_images;
DROP POLICY IF EXISTS diagnosis_images_insert ON diagnosis_images;
DROP POLICY IF EXISTS diagnosis_images_update ON diagnosis_images;
DROP POLICY IF EXISTS diagnosis_images_delete ON diagnosis_images;

CREATE POLICY diagnosis_images_select ON diagnosis_images FOR SELECT
USING (diagnosis_id IN (SELECT id FROM diagnoses WHERE farm_id = current_farm_id()));

CREATE POLICY diagnosis_images_insert ON diagnosis_images FOR INSERT
WITH CHECK (diagnosis_id IN (SELECT id FROM diagnoses WHERE farm_id = current_farm_id()));

CREATE POLICY diagnosis_images_update ON diagnosis_images FOR UPDATE
USING (diagnosis_id IN (SELECT id FROM diagnoses WHERE farm_id = current_farm_id()));

CREATE POLICY diagnosis_images_delete ON diagnosis_images FOR DELETE
USING (diagnosis_id IN (SELECT id FROM diagnoses WHERE farm_id = current_farm_id()));


-- ── crop_stages → crops (SYSTEM public / FARM private) ──────
ALTER TABLE crop_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crop_stages_visibility ON crop_stages;
DROP POLICY IF EXISTS crop_stages_modify     ON crop_stages;
DROP POLICY IF EXISTS crop_stages_select     ON crop_stages;
DROP POLICY IF EXISTS crop_stages_insert     ON crop_stages;
DROP POLICY IF EXISTS crop_stages_update     ON crop_stages;
DROP POLICY IF EXISTS crop_stages_delete     ON crop_stages;

CREATE POLICY crop_stages_select ON crop_stages FOR SELECT
USING (
    crop_id IN (
        SELECT id FROM crops
        WHERE scope = 'SYSTEM' OR (scope = 'FARM' AND farm_id = current_farm_id())
    )
);

CREATE POLICY crop_stages_insert ON crop_stages FOR INSERT
WITH CHECK (
    crop_id IN (SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id())
);

CREATE POLICY crop_stages_update ON crop_stages FOR UPDATE
USING (
    crop_id IN (SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id())
);

CREATE POLICY crop_stages_delete ON crop_stages FOR DELETE
USING (
    crop_id IN (SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id())
);


-- ── crop_conditions → crops (SYSTEM public / FARM private) ──
ALTER TABLE crop_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_conditions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crop_conditions_visibility ON crop_conditions;
DROP POLICY IF EXISTS crop_conditions_modify     ON crop_conditions;
DROP POLICY IF EXISTS crop_conditions_select     ON crop_conditions;
DROP POLICY IF EXISTS crop_conditions_insert     ON crop_conditions;
DROP POLICY IF EXISTS crop_conditions_update     ON crop_conditions;
DROP POLICY IF EXISTS crop_conditions_delete     ON crop_conditions;

CREATE POLICY crop_conditions_select ON crop_conditions FOR SELECT
USING (
    crop_id IN (
        SELECT id FROM crops
        WHERE scope = 'SYSTEM' OR (scope = 'FARM' AND farm_id = current_farm_id())
    )
);

CREATE POLICY crop_conditions_insert ON crop_conditions FOR INSERT
WITH CHECK (
    crop_id IN (SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id())
);

CREATE POLICY crop_conditions_update ON crop_conditions FOR UPDATE
USING (
    crop_id IN (SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id())
);

CREATE POLICY crop_conditions_delete ON crop_conditions FOR DELETE
USING (
    crop_id IN (SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id())
);


-- ============================================================
-- VERIFY
-- ============================================================
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;