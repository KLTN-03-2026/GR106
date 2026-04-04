
-- ============================================================
-- FARM MANAGEMENT SYSTEM — PRODUCTION SCHEMA
-- Version: v5
-- Changes vs v4:
--   [ENUM-1] plot_status enum thay CHECK trên plots.status
--   [ENUM-2] severity_level enum thay CHECK trên diseases.severity_level
--   [ENUM-3] diagnosis_source enum thay CHECK trên diagnoses.source
--   [ENUM-4] diagnosis_status enum thay CHECK trên diagnoses.status
--   [ENUM-5] disease_report_source enum thay CHECK trên disease_reports.source
--   [ENUM-6] invitation_status enum thay CHECK trên invitations.status
--   [ENUM-7] plan_status enum thay CHECK trên plans.status
--
--   [FIX-1]  crops: bỏ cloned_from_id ở v4 — thêm lại (bị drop nhầm)
--   [FIX-2]  task_skip_days.approved_by: NOT NULL quá cứng → nullable
--            (người tạo skip chưa cần approved ngay)
--   [FIX-3]  tasks.start_date / end_date: NOT NULL quá cứng → nullable
--            (task có thể tạo trước khi xác định ngày)
--   [FIX-4]  plans: bỏ composite FK workaround, giữ FK thường +
--            thêm CHECK trigger-based ở service layer note
--            (composite FK yêu cầu UNIQUE index có điều kiện — không
--             portable với một số ORM/migration tool)
--   [FIX-5]  fn_update_stock: fix race condition — dùng SELECT...FOR UPDATE
--            trước khi UPDATE thay vì đọc lại sau INSERT ON CONFLICT
--   [FIX-6]  subscription_history.event_type: giữ CHECK (không đổi sang enum)
--            vì có thể thêm event mới mà không muốn ALTER TYPE
--   [FIX-7]  users.phone UNIQUE bỏ — phone có thể null và
--            UNIQUE trên nullable column gây vấn đề với nhiều user chưa nhập
--   [FIX-8]  CREATE TABLE email_verification_tokens
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- ENUMS
-- ============================================================

-- Auth / User
CREATE TYPE user_status         AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- Payment
CREATE TYPE payment_gateway     AS ENUM ('VNPAY', 'MOMO', 'STRIPE');
CREATE TYPE payment_status      AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- Subscription
CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD');
CREATE TYPE billing_cycle       AS ENUM ('MONTHLY', 'ANNUAL');

-- Crop
CREATE TYPE crop_scope          AS ENUM ('SYSTEM', 'FARM');
CREATE TYPE plan_stage_source   AS ENUM ('TEMPLATE', 'CUSTOM');

-- Work
CREATE TYPE work_log_type       AS ENUM ('NORMAL', 'MAKEUP');

-- Warehouse
CREATE TYPE warehouse_txn_type  AS ENUM (
    'IMPORT_MANUAL',
    'EXPORT_TASK',
    'EXPORT_MANUAL',
    'HARVEST_IN',
    'ADJUST',
    'TRANSFER_OUT',
    'TRANSFER_IN'
);

-- [ENUM-1] Plot
CREATE TYPE plot_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- [ENUM-2] Disease severity
CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- [ENUM-3] Diagnosis source
CREATE TYPE diagnosis_source AS ENUM ('EMPLOYEE_REPORT', 'FARMER_INITIATED');

-- [ENUM-4] Diagnosis status
CREATE TYPE diagnosis_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- [ENUM-5] Disease report source
CREATE TYPE disease_report_source AS ENUM ('TASK', 'FARMER_REPORT');

-- [ENUM-6] Invitation status
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- [ENUM-7] Plan status
CREATE TYPE plan_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'READY_TO_HARVEST',
    'HARVESTING',
    'COMPLETED',
    'CANCELLED'
);


-- ============================================================
-- 1. PERMISSIONS
-- ============================================================
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(250) UNIQUE NOT NULL,
    description TEXT
);
CREATE INDEX idx_permissions_name ON permissions(name);


-- ============================================================
-- 2. ROLES
-- ============================================================
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);


-- ============================================================
-- 3. ROLE_PERMISSIONS
-- ============================================================
CREATE TABLE role_permissions (
    permission_id UUID NOT NULL REFERENCES permissions(id),
    role_id       UUID NOT NULL REFERENCES roles(id),
    PRIMARY KEY (permission_id, role_id)
);


-- ============================================================
-- 4. USERS
-- [FIX-7] Bỏ UNIQUE trên phone — nullable unique gây index bloat
--         và vấn đề khi nhiều user chưa nhập số điện thoại
-- ============================================================
CREATE TABLE users (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                VARCHAR(255) NOT NULL,
    password_hash        VARCHAR(255) NOT NULL,
    full_name            VARCHAR(100) NOT NULL,
    phone                VARCHAR(20),
    avatar_url           TEXT,
    status               user_status NOT NULL DEFAULT 'PENDING',
    login_attempts       SMALLINT  DEFAULT 0,
    is_locked            BOOLEAN   DEFAULT FALSE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    deleted_at           TIMESTAMP
);
CREATE UNIQUE INDEX unique_email_lower ON users(LOWER(email));
-- Phone unique chỉ khi đã nhập (không null)
CREATE UNIQUE INDEX unique_phone_non_null ON users(phone) WHERE phone IS NOT NULL;


-- ============================================================
-- 5. EMAIL_VERIFICATION_TOKENS
-- ============================================================
CREATE TABLE email_verification_tokens(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
-- ============================================================
-- 5. USER_ROLES
-- ============================================================
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);


-- ============================================================
-- 6. REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    user_agent TEXT,
    ip_address VARCHAR(45),
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);


-- ============================================================
-- 7. PASSWORD RESET TOKENS
-- ============================================================
CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at    TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 8. FARMS
-- ============================================================
CREATE TABLE farms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES users(id),
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    updated_by  UUID REFERENCES users(id),
    deleted_at  TIMESTAMP
);
CREATE UNIQUE INDEX unique_owner_farm_name
    ON farms(owner_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_farms_not_deleted
    ON farms(deleted_at) WHERE deleted_at IS NULL;


-- ============================================================
-- 9. AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    farm_id     UUID REFERENCES farms(id) ON DELETE SET NULL,
    ip_address  VARCHAR(45),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id   UUID        NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    reason      TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_actor  ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_farm   ON audit_logs(farm_id,  created_at DESC);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
COMMENT ON TABLE audit_logs IS
    'High write volume → cân nhắc PARTITION BY RANGE(created_at) theo tháng khi > 1M rows/tháng.';


-- ============================================================
-- 10. FARM CONFIGS
-- ============================================================
CREATE TABLE farm_configs (
    farm_id                  UUID        PRIMARY KEY REFERENCES farms(id) ON DELETE CASCADE,
    timezone                 VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    locale                   VARCHAR(10) NOT NULL DEFAULT 'vi',
    currency                 VARCHAR(3)  NOT NULL DEFAULT 'VND',
    allow_crop_clone         BOOLEAN     NOT NULL DEFAULT TRUE,
    task_overdue_notify_days SMALLINT    NOT NULL DEFAULT 1,
    created_at               TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP
);
COMMENT ON TABLE farm_configs IS
    'Tạo tự động sau INSERT INTO farms (trigger hoặc service layer).';


-- ============================================================
-- 11. SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE subscription_plans (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(100) UNIQUE NOT NULL,
    price_monthly    DECIMAL(15,2) NOT NULL,
    price_annual     DECIMAL(15,2),
    max_plots        SMALLINT NOT NULL,
    max_members      SMALLINT NOT NULL,
    has_ai_diagnosis BOOLEAN  NOT NULL DEFAULT FALSE,
    has_pdf_export   BOOLEAN  NOT NULL DEFAULT FALSE,
    has_map          BOOLEAN  NOT NULL DEFAULT FALSE,
    description      TEXT,
    is_active        BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 12. FARM SUBSCRIPTIONS
-- ============================================================
CREATE TABLE farm_subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id              UUID NOT NULL REFERENCES farms(id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status               subscription_status NOT NULL DEFAULT 'TRIAL',
    billing_cycle        billing_cycle       NOT NULL DEFAULT 'MONTHLY',
    is_current           BOOLEAN             NOT NULL DEFAULT TRUE,
    started_at           TIMESTAMP           NOT NULL DEFAULT NOW(),
    expires_at           TIMESTAMP,
    grace_until          TIMESTAMP,
    cancelled_at         TIMESTAMP,
    cancellation_reason  TEXT,
    auto_renew           BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP
);
CREATE UNIQUE INDEX idx_farm_subscription_current
    ON farm_subscriptions(farm_id) WHERE is_current = TRUE;
CREATE INDEX idx_farm_subscriptions_farm
    ON farm_subscriptions(farm_id, started_at DESC);
COMMENT ON TABLE farm_subscriptions IS
    'Upgrade/downgrade: UPDATE is_current=FALSE cho row cũ, INSERT row mới is_current=TRUE. Dùng transaction.';


-- ============================================================
-- 13. SUBSCRIPTION HISTORY
-- [FIX-6] event_type giữ CHECK không đổi sang enum
--         → thêm event mới chỉ cần sửa CHECK, không cần ALTER TYPE
-- ============================================================
CREATE TABLE subscription_history (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id              UUID NOT NULL REFERENCES farms(id),
    farm_subscription_id UUID NOT NULL REFERENCES farm_subscriptions(id),
    event_type           VARCHAR(20) NOT NULL,
    from_subscription_plan_id UUID REFERENCES subscription_plans(id),
    to_subscription_plan_id   UUID REFERENCES subscription_plans(id),
    triggered_by         UUID REFERENCES users(id),
    notes                TEXT,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_sub_event_type CHECK (
        event_type IN ('CREATED','UPGRADED','DOWNGRADED',
                       'RENEWED','CANCELLED','EXPIRED',
                       'GRACE_STARTED','REACTIVATED')
    )
);
CREATE INDEX idx_sub_history_farm ON subscription_history(farm_id, created_at DESC);


-- ============================================================
-- 14. PAYMENT TRANSACTIONS
-- ============================================================
CREATE TABLE payment_transactions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id              UUID NOT NULL REFERENCES farms(id),
    user_id              UUID NOT NULL REFERENCES users(id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    farm_subscription_id UUID REFERENCES farm_subscriptions(id),
    amount               DECIMAL(15,2)   NOT NULL,
    currency             VARCHAR(3)      NOT NULL DEFAULT 'VND',
    gateway              payment_gateway NOT NULL,
    gateway_txn_id       VARCHAR(255),
    status               payment_status  NOT NULL DEFAULT 'PENDING',
    paid_at              TIMESTAMP,
    plan_expires_at      TIMESTAMP,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(gateway, gateway_txn_id)
);
CREATE INDEX idx_payment_farm    ON payment_transactions(farm_id, created_at DESC);
CREATE INDEX idx_payment_pending ON payment_transactions(status, created_at)
    WHERE status = 'PENDING';


-- ============================================================
-- 15. FARM ROLES
-- ============================================================
CREATE TABLE farm_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 16. FARM MEMBERS
-- ============================================================
CREATE TABLE farm_members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id      UUID    NOT NULL REFERENCES farms(id),
    user_id      UUID    NOT NULL REFERENCES users(id),
    farm_role_id UUID    NOT NULL REFERENCES farm_roles(id),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, user_id)
);
CREATE INDEX idx_farm_members_user ON farm_members(user_id);
CREATE INDEX idx_farm_members_farm ON farm_members(farm_id);


-- ============================================================
-- 17. FARM ROLE PERMISSIONS
-- ============================================================
CREATE TABLE farm_role_permissions (
    farm_role_id  UUID NOT NULL REFERENCES farm_roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (farm_role_id, permission_id)
);
CREATE INDEX idx_frp_role       ON farm_role_permissions(farm_role_id);
CREATE INDEX idx_frp_permission ON farm_role_permissions(permission_id);


-- ============================================================
-- 18. INVITATIONS
-- [ENUM-6] invitation_status enum
-- ============================================================
CREATE TABLE invitations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id      UUID NOT NULL REFERENCES farms(id),
    invited_by   UUID NOT NULL REFERENCES users(id),
    email        VARCHAR(255)      NOT NULL,
    farm_role_id UUID              NOT NULL REFERENCES farm_roles(id),
    status       invitation_status NOT NULL DEFAULT 'PENDING',
    expires_at   TIMESTAMP         NOT NULL,
    accepted_at  TIMESTAMP,
    created_at   TIMESTAMP         NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invitations_email_pending
    ON invitations(email, farm_id) WHERE status = 'PENDING';
CREATE UNIQUE INDEX unique_pending_invite
ON invitations(email, farm_id)
WHERE status = 'PENDING';


-- ============================================================
-- 19. UNITS
-- ============================================================
CREATE TABLE units (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code       VARCHAR(20) UNIQUE NOT NULL,
    name       VARCHAR(50)        NOT NULL,
    unit_type  VARCHAR(20)        NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 20. PLOTS
-- [ENUM-1] plot_status enum thay CHECK
-- ============================================================
CREATE TABLE plots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id     UUID        NOT NULL REFERENCES farms(id),
    name        VARCHAR(150) NOT NULL,
    area_ha     DECIMAL(10,4),
    status      plot_status  NOT NULL DEFAULT 'ACTIVE',
    geometry    GEOMETRY(POLYGON, 4326),
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP
);
CREATE INDEX idx_plots_geom ON plots USING GIST (geometry);
CREATE UNIQUE INDEX idx_plots_name_per_farm
    ON plots(farm_id, name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_plots_farm_id_id
    ON plots(farm_id, id) WHERE deleted_at IS NULL;


-- ============================================================
-- 21. SOIL RECORDS
-- ============================================================
CREATE TABLE soil_records (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id          UUID NOT NULL REFERENCES plots(id),
    farm_id          UUID NOT NULL REFERENCES farms(id),
    created_by       UUID NOT NULL REFERENCES users(id),
    sampled_at       DATE NOT NULL,
    ph               DECIMAL(4,2),
    nitrogen_mg_kg   DECIMAL(8,2),
    phosphorus_mg_kg DECIMAL(8,2),
    potassium_mg_kg  DECIMAL(8,2),
    moisture_percent DECIMAL(5,2),
    notes            TEXT,
    source_file_url  TEXT,
    locked_at        TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMP,
    CONSTRAINT chk_ph CHECK (ph >= 0 AND ph <= 14)
);
CREATE INDEX idx_soil_records_farm ON soil_records(farm_id, sampled_at DESC);
CREATE INDEX idx_soil_records_plot ON soil_records(plot_id, sampled_at DESC);


-- ============================================================
-- 22. SOIL AI RESULTS
-- ============================================================
CREATE TABLE soil_ai_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    soil_record_id  UUID NOT NULL REFERENCES soil_records(id),
    plot_id         UUID NOT NULL REFERENCES plots(id),
    farm_id         UUID NOT NULL REFERENCES farms(id),
    requested_by    UUID NOT NULL REFERENCES users(id),
    source_file_url TEXT  NOT NULL,
    extracted_data  JSONB NOT NULL,
    ai_suggestions  JSONB NOT NULL,
    ai_model        VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);
CREATE INDEX idx_soil_ai_farm ON soil_ai_results(farm_id, created_at DESC);


-- ============================================================
-- 23. CROP TYPES
-- ============================================================
CREATE TABLE crop_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 24. CROPS
-- [FIX-1] Thêm lại cloned_from_id — bị bỏ sót ở v4
-- ============================================================
CREATE TABLE crops (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_type_id   UUID NOT NULL REFERENCES crop_types(id),
    farm_id        UUID REFERENCES farms(id),
    scope          crop_scope NOT NULL DEFAULT 'SYSTEM',
    cloned_from_id UUID REFERENCES crops(id),              -- [FIX-1]
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    image_url      TEXT,
    created_by     UUID REFERENCES users(id),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMP,
    CONSTRAINT chk_crop_scope_farm_id CHECK (
        (scope = 'SYSTEM' AND farm_id IS NULL) OR
        (scope = 'FARM'   AND farm_id IS NOT NULL)
    )
);
CREATE UNIQUE INDEX idx_crops_system_name_active
    ON crops(name) WHERE deleted_at IS NULL AND scope = 'SYSTEM';
CREATE UNIQUE INDEX idx_crops_farm_name_active
    ON crops(farm_id, name) WHERE deleted_at IS NULL AND scope = 'FARM';
CREATE INDEX idx_crops_farm_id
    ON crops(farm_id) WHERE farm_id IS NOT NULL;
CREATE INDEX idx_crops_cloned_from
    ON crops(cloned_from_id) WHERE cloned_from_id IS NOT NULL;


-- ============================================================
-- 25. CROP STAGES
-- ============================================================
CREATE TABLE crop_stages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id       UUID     NOT NULL REFERENCES crops(id),
    name          VARCHAR(150) NOT NULL,
    order_index   SMALLINT NOT NULL,
    duration_days SMALLINT NOT NULL,
    description   TEXT
);
CREATE INDEX idx_crop_stages_crop ON crop_stages(crop_id, order_index);


-- ============================================================
-- 26. CROP CONDITIONS
-- ============================================================
CREATE TABLE crop_conditions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id        UUID UNIQUE NOT NULL REFERENCES crops(id),
    ph_min         DECIMAL(4,2),
    ph_max         DECIMAL(4,2),
    nitrogen_min   DECIMAL(8,2),
    nitrogen_max   DECIMAL(8,2),
    phosphorus_min DECIMAL(8,2),
    phosphorus_max DECIMAL(8,2),
    potassium_min  DECIMAL(8,2),
    potassium_max  DECIMAL(8,2),
    -- Range validation
    CONSTRAINT chk_ph_range   CHECK (ph_min IS NULL OR ph_max IS NULL OR ph_min <= ph_max),
    CONSTRAINT chk_n_range    CHECK (nitrogen_min IS NULL OR nitrogen_max IS NULL OR nitrogen_min <= nitrogen_max),
    CONSTRAINT chk_p_range    CHECK (phosphorus_min IS NULL OR phosphorus_max IS NULL OR phosphorus_min <= phosphorus_max),
    CONSTRAINT chk_k_range    CHECK (potassium_min IS NULL OR potassium_max IS NULL OR potassium_min <= potassium_max)
);


-- ============================================================
-- 27. DISEASES
-- [ENUM-2] severity_level enum
-- ============================================================
CREATE TABLE diseases (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(200) UNIQUE NOT NULL,
    symptoms       TEXT           NOT NULL,
    treatment      TEXT           NOT NULL,
    severity_level severity_level,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 28. CROP DISEASES
-- ============================================================
CREATE TABLE crop_diseases (
    crop_id    UUID NOT NULL REFERENCES crops(id),
    disease_id UUID NOT NULL REFERENCES diseases(id),
    is_primary BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (crop_id, disease_id)
);


-- ============================================================
-- 29. CROP DISEASE IMAGES
-- ============================================================
CREATE TABLE crop_disease_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id  UUID     NOT NULL REFERENCES diseases(id),
    image_url   TEXT     NOT NULL,
    caption     VARCHAR(255),
    order_index SMALLINT NOT NULL
);


-- ============================================================
-- 30. PLAN STAGE STATUSES (global lookup)
-- ============================================================
CREATE TABLE plan_stage_statuses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50)  UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    is_initial  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_terminal BOOLEAN      NOT NULL DEFAULT FALSE,
    order_index SMALLINT,
    color       VARCHAR(20),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX one_initial_plan_stage
    ON plan_stage_statuses(is_initial) WHERE is_initial = TRUE;


-- ============================================================
-- 31. PLAN STAGE STATUS TRANSITIONS (farm-aware)
-- ============================================================
CREATE TABLE plan_stage_status_transitions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id        UUID REFERENCES farms(id),
    from_status_id UUID NOT NULL REFERENCES plan_stage_statuses(id),
    to_status_id   UUID NOT NULL REFERENCES plan_stage_statuses(id),
    farm_role_id   UUID REFERENCES farm_roles(id),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, from_status_id, to_status_id),
    CONSTRAINT chk_psst_no_self CHECK (from_status_id != to_status_id)
);
CREATE INDEX idx_psst_lookup
    ON plan_stage_status_transitions(farm_id, from_status_id);


-- ============================================================
-- 32. PLANS
-- [ENUM-7] plan_status enum thay CHECK
-- [FIX-4]  Bỏ composite FK workaround → giữ FK thường trên plot_id
--          Enforce "plot thuộc farm" ở service layer (xem note cuối)
-- ============================================================
CREATE TABLE plans (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id        UUID        NOT NULL REFERENCES farms(id),
    crop_id        UUID        NOT NULL REFERENCES crops(id),
    cloned_from_id UUID        REFERENCES plans(id),
    name           VARCHAR(200) NOT NULL,
    start_date     DATE         NOT NULL,
    end_date       DATE,
    status         plan_status  NOT NULL DEFAULT 'DRAFT',
    notes          TEXT,
    created_by     UUID NOT NULL REFERENCES users(id),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMP,
    CONSTRAINT chk_plan_dates CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX idx_plans_farm ON plans(farm_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_plans_crop ON plans(crop_id)          WHERE deleted_at IS NULL;

-- 2. plan_plots thay thế
CREATE TABLE plan_plots (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id            UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    plot_id            UUID NOT NULL REFERENCES plots(id),
    farm_id            UUID NOT NULL REFERENCES farms(id),
    plot_name_snapshot VARCHAR(150) NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (plan_id, plot_id)
);


-- ============================================================
-- 33. PLAN STAGES
-- ============================================================
CREATE TABLE plan_stages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id             UUID     NOT NULL REFERENCES plans(id),
    crop_stage_id       UUID     REFERENCES crop_stages(id),
    status_id           UUID     NOT NULL REFERENCES plan_stage_statuses(id),
    source              plan_stage_source NOT NULL DEFAULT 'TEMPLATE',
    name                VARCHAR(150) NOT NULL,
    order_index         SMALLINT     NOT NULL,
    start_date          DATE         NOT NULL,
    end_date            DATE,
    ai_suggestion_cache JSONB,
    ai_cached_at        TIMESTAMP,
    CONSTRAINT chk_template_needs_crop_stage CHECK (
        source = 'CUSTOM' OR crop_stage_id IS NOT NULL
    )
);
CREATE INDEX idx_plan_stages_plan ON plan_stages(plan_id, order_index);
COMMENT ON COLUMN plan_stages.ai_suggestion_cache IS
    'Reset về NULL khi clone plan hoặc thay đổi crop.';


-- ============================================================
-- 34. PLAN STAGE STATUS HISTORIES
-- ============================================================
CREATE TABLE plan_stage_status_histories (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_stage_id  UUID NOT NULL REFERENCES plan_stages(id),
    farm_id        UUID NOT NULL REFERENCES farms(id),
    from_status_id UUID REFERENCES plan_stage_statuses(id),
    to_status_id   UUID NOT NULL REFERENCES plan_stage_statuses(id),
    changed_by     UUID REFERENCES users(id),
    changed_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pssh_plan_stage ON plan_stage_status_histories(plan_stage_id, changed_at DESC);
CREATE INDEX idx_pssh_farm       ON plan_stage_status_histories(farm_id, changed_at DESC);


-- ============================================================
-- 35. TASK STATUSES (global lookup)
-- ============================================================
CREATE TABLE task_statuses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50)  UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    is_initial  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_terminal BOOLEAN      NOT NULL DEFAULT FALSE,
    order_index SMALLINT,
    color       VARCHAR(20),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX one_initial_task_status
    ON task_statuses(is_initial) WHERE is_initial = TRUE;


-- ============================================================
-- 36. TASK STATUS TRANSITIONS (farm-aware)
-- ============================================================
CREATE TABLE task_status_transitions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id        UUID REFERENCES farms(id),
    from_status_id UUID NOT NULL REFERENCES task_statuses(id),
    to_status_id   UUID NOT NULL REFERENCES task_statuses(id),
    farm_role_id   UUID REFERENCES farm_roles(id),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, from_status_id, to_status_id),
    CONSTRAINT chk_tst_no_self CHECK (from_status_id != to_status_id)
);
CREATE INDEX idx_tst_lookup ON task_status_transitions(farm_id, from_status_id);


-- ============================================================
-- 37. TASKS
-- [FIX-3] start_date / end_date nullable
--         Task có thể tạo trước khi lên lịch cụ thể
-- ============================================================
CREATE TABLE tasks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_stage_id    UUID NOT NULL REFERENCES plan_stages(id),
    farm_id          UUID NOT NULL REFERENCES farms(id),
    plot_id          UUID REFERENCES plots(id), -- nullable, enforce khi ACTIVE
    status_id        UUID NOT NULL REFERENCES task_statuses(id),
    name             VARCHAR(200) NOT NULL,
    description      TEXT,
    start_date       DATE,                                   -- [FIX-3] nullable
    end_date         DATE,                                   -- [FIX-3] nullable
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    accepted_at      TIMESTAMP,
    completed_at     TIMESTAMP,
    created_by       UUID NOT NULL REFERENCES users(id),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_progress   CHECK (progress_percent >= 0 AND progress_percent <= 100),
    CONSTRAINT chk_task_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_task_date_consistency CHECK (start_date IS NOT NULL OR end_date IS NULL),
    CONSTRAINT chk_task_timeline CHECK (accepted_at IS NULL OR completed_at IS NULL OR accepted_at <= completed_at),
    CONSTRAINT chk_task_completion
CHECK (
    (progress_percent < 100)
    OR
    (progress_percent = 100 AND completed_at IS NOT NULL)
)
);
CREATE INDEX idx_tasks_farm       ON tasks(farm_id, status_id);
CREATE INDEX idx_tasks_plan_stage ON tasks(plan_stage_id);
CREATE INDEX idx_tasks_plot    ON tasks(plot_id);
CREATE INDEX idx_tasks_no_plot ON tasks(plan_stage_id)
    WHERE plot_id IS NULL;

-- ============================================================
-- 38. TASK STATUS HISTORIES
-- ============================================================
CREATE TABLE task_status_histories (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id        UUID NOT NULL REFERENCES tasks(id),
    from_status_id UUID REFERENCES task_statuses(id),
    to_status_id   UUID NOT NULL REFERENCES task_statuses(id),
    changed_by     UUID REFERENCES users(id),
    changed_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tsh_task ON task_status_histories(task_id, changed_at DESC);


-- ============================================================
-- 39. TASK DEPENDENCIES
-- ============================================================
CREATE TABLE task_dependencies (
    task_id            UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (task_id, depends_on_task_id),
    CONSTRAINT chk_no_self_dep CHECK (task_id != depends_on_task_id)
);


-- ============================================================
-- 40. TASK ASSIGNEES
-- ============================================================
CREATE TABLE task_assignees (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID NOT NULL REFERENCES tasks(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_by UUID NOT NULL REFERENCES users(id),
    removal_reason VARCHAR(200),
    removed_by UUID REFERENCES users(id),
    removed_at TIMESTAMP,
    UNIQUE (task_id, user_id)
);
CREATE INDEX idx_task_assignees_user ON task_assignees(user_id)
    WHERE deleted_at IS NULL;


-- ============================================================
-- 41. TASK SKIP DAYS
-- [FIX-2] approved_by nullable — skip có thể chưa được duyệt ngay
-- ============================================================
CREATE TABLE task_skip_days (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID NOT NULL REFERENCES tasks(id),
    skip_date   DATE NOT NULL,
    reason      VARCHAR(255),
    approved_by UUID REFERENCES users(id),                 -- [FIX-2] nullable
    approved_at TIMESTAMP,                                 -- thêm timestamp duyệt
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, skip_date),
    -- Nếu có approved_by thì phải có approved_at và ngược lại
    CONSTRAINT chk_approval_consistent CHECK (
        (approved_by IS NULL) = (approved_at IS NULL)
    )
);

-- ============================================================
-- WORK SHIFTS
-- Định nghĩa ca làm việc theo từng farm.
-- Farm tự cấu hình ca sáng/ca chiều/cả ngày với hệ số ngày công.
-- coefficient: 1.0 = 1 ngày công, 0.5 = nửa ngày công.
-- Dùng để tính lương: daily_rate × coefficient × (is_overtime ? ot_multiplier : 1.0)
-- ============================================================
CREATE TABLE work_shifts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id     UUID NOT NULL REFERENCES farms(id),
    name        VARCHAR(100) NOT NULL,   -- "Ca sáng", "Ca chiều", "Cả ngày"
    start_time  TIME NOT NULL,           -- Giờ bắt đầu ca
    end_time    TIME NOT NULL,           -- Giờ kết thúc ca
    coefficient DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    -- Hệ số ngày công: 1.0 = cả ngày, 0.5 = nửa ngày
    -- Dùng để tính: 1 ca sáng + 1 ca chiều = 1 ngày công
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, name),
    CONSTRAINT chk_shift_time    CHECK (end_time > start_time),
    CONSTRAINT chk_coefficient   CHECK (coefficient > 0 AND coefficient <= 1)
);
COMMENT ON TABLE work_shifts IS
    'Ca làm việc do farm tự định nghĩa. '
    'Seed data gợi ý: Ca sáng (0.5), Ca chiều (0.5), Cả ngày (1.0). '
    'shift_id nullable trong work_logs — không bắt buộc chọn ca nếu farm không cần.';
COMMENT ON COLUMN work_shifts.coefficient IS
    'Hệ số ngày công của ca này. '
    'VD: Ca sáng = 0.5, Ca chiều = 0.5, Cả ngày = 1.0. '
    'Tổng coefficient các ca trong ngày = số ngày công ngày đó.';

-- ============================================================
-- 42. WORK LOGS
-- ============================================================
CREATE TABLE work_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID NOT NULL REFERENCES tasks(id),
    farm_id     UUID NOT NULL REFERENCES farms(id),
    employee_id UUID NOT NULL REFERENCES users(id),
    work_date   DATE NOT NULL,
    shift_id    UUID REFERENCES work_shifts(id),
    type        work_log_type NOT NULL DEFAULT 'NORMAL',
    is_overtime BOOLEAN NOT NULL DEFAULT FALSE,
    notes       TEXT,
    locked_at   TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, employee_id, work_date, shift_id)
);
CREATE INDEX idx_work_logs_farm     ON work_logs(farm_id, work_date DESC);
CREATE INDEX idx_work_logs_employee ON work_logs(employee_id, work_date DESC);
CREATE INDEX idx_work_logs_task     ON work_logs(task_id);


-- ============================================================
-- 43. WORK LOG IMAGES
-- ============================================================
CREATE TABLE work_log_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_log_id UUID     NOT NULL REFERENCES work_logs(id),
    image_url   TEXT     NOT NULL,
    order_index SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_work_log_images_log ON work_log_images(work_log_id);


-- ============================================================
-- 44. WAREHOUSES
-- ============================================================
CREATE TABLE warehouses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id     UUID NOT NULL REFERENCES farms(id),
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    address     VARCHAR(500),
    latitude     DECIMAL(9,6),
    longitude    DECIMAL(9,6),
    is_active   BOOLEAN   NOT NULL DEFAULT TRUE,
    created_by  UUID      NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP
);
CREATE UNIQUE INDEX idx_warehouses_name_per_farm
    ON warehouses(farm_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_warehouses_farm
    ON warehouses(farm_id) WHERE deleted_at IS NULL;
COMMENT ON TABLE warehouses IS
    'Mỗi farm có thể có nhiều kho: kho vật tư, kho nông sản, kho lạnh, v.v.';

-- ============================================================
-- 45. WAREHOUSE LOCATIONS
-- ============================================================
CREATE TABLE warehouse_locations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    farm_id      UUID NOT NULL REFERENCES farms(id),
    code         VARCHAR(50)  NOT NULL,
    name         VARCHAR(150) NOT NULL,
    description  TEXT,
    is_active    BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMP,
    UNIQUE (warehouse_id, code)
);
CREATE INDEX idx_wh_locations_warehouse
    ON warehouse_locations(warehouse_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_wh_locations_farm
    ON warehouse_locations(farm_id) WHERE deleted_at IS NULL;


-- ============================================================
-- 46. WAREHOUSE ITEMS
-- ============================================================
CREATE TABLE warehouse_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id  UUID NOT NULL REFERENCES warehouses(id),
    farm_id       UUID NOT NULL REFERENCES farms(id),
    name          VARCHAR(200) NOT NULL,
    sku           VARCHAR(100),
    unit_id       UUID NOT NULL REFERENCES units(id),
    unit_price    DECIMAL(15,2),
    supplier      VARCHAR(200),
    min_stock_qty DECIMAL(10,3),
    created_by    UUID      NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    deleted_at    TIMESTAMP,
    UNIQUE (warehouse_id, name)
);
CREATE UNIQUE INDEX idx_warehouse_items_sku
    ON warehouse_items(warehouse_id, sku) WHERE sku IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_warehouse_items_farm
    ON warehouse_items(farm_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_warehouse_items_warehouse
    ON warehouse_items(warehouse_id) WHERE deleted_at IS NULL;


-- ============================================================
-- 47. WAREHOUSE STOCK
-- ============================================================
CREATE TABLE warehouse_stock (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_item_id UUID          NOT NULL REFERENCES warehouse_items(id),
    location_id       UUID          NOT NULL REFERENCES warehouse_locations(id),
    farm_id           UUID          NOT NULL REFERENCES farms(id),
    qty_on_hand       DECIMAL(10,3) NOT NULL DEFAULT 0,
    last_updated_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (warehouse_item_id, location_id),
    CONSTRAINT chk_stock_non_negative CHECK (qty_on_hand >= 0)
);
CREATE INDEX idx_stock_farm     ON warehouse_stock(farm_id);
CREATE INDEX idx_stock_item     ON warehouse_stock(warehouse_item_id);
CREATE INDEX idx_stock_location ON warehouse_stock(location_id);
CREATE INDEX idx_stock_low      ON warehouse_stock(warehouse_item_id, qty_on_hand);
COMMENT ON TABLE warehouse_stock IS
    'Tồn kho thực tế theo (item, vị trí). KHÔNG cập nhật trực tiếp — chỉ ghi qua warehouse_transactions.';


-- ============================================================
-- 48. WAREHOUSE TRANSACTIONS
-- ============================================================
CREATE TABLE warehouse_transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id           UUID NOT NULL REFERENCES farms(id),
    warehouse_id      UUID NOT NULL REFERENCES warehouses(id),
    warehouse_item_id UUID NOT NULL REFERENCES warehouse_items(id),
    from_location_id  UUID REFERENCES warehouse_locations(id),
    to_location_id    UUID REFERENCES warehouse_locations(id),
    type              warehouse_txn_type NOT NULL,
    qty_change        DECIMAL(10,3)      NOT NULL,
    ref_transfer_id   UUID REFERENCES warehouse_transactions(id),
    ref_work_log_id   UUID REFERENCES work_logs(id),
    ref_task_id       UUID REFERENCES tasks(id),
    ref_harvest_id    UUID,
    performed_by      UUID NOT NULL REFERENCES users(id),
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_txn_location CHECK (
        (type IN ('EXPORT_TASK','EXPORT_MANUAL','TRANSFER_OUT','ADJUST')
            AND from_location_id IS NOT NULL)
        OR
        (type IN ('IMPORT_MANUAL','HARVEST_IN','TRANSFER_IN')
            AND to_location_id IS NOT NULL)
    ),
    CONSTRAINT chk_qty_positive CHECK (qty_change > 0)
);
CREATE INDEX idx_wt_farm      ON warehouse_transactions(farm_id, created_at DESC);
CREATE INDEX idx_wt_item      ON warehouse_transactions(warehouse_item_id, created_at DESC);
CREATE INDEX idx_wt_warehouse ON warehouse_transactions(warehouse_id, created_at DESC);
CREATE INDEX idx_wt_from_loc  ON warehouse_transactions(from_location_id) WHERE from_location_id IS NOT NULL;
CREATE INDEX idx_wt_to_loc    ON warehouse_transactions(to_location_id)   WHERE to_location_id IS NOT NULL;


-- ============================================================
-- 49. TRIGGER: cập nhật warehouse_stock sau mỗi giao dịch
-- [FIX-5] Fix race condition: dùng SELECT...FOR UPDATE
--         trước khi UPDATE để lock row, tránh lost update
--         khi 2 transaction cùng xuất kho đồng thời
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_current_qty DECIMAL(10,3);
BEGIN
    -- ── Xuất khỏi from_location ──────────────────────────────
    IF NEW.from_location_id IS NOT NULL THEN
        -- Lock row trước để tránh race condition
        SELECT qty_on_hand INTO v_current_qty
        FROM warehouse_stock
        WHERE warehouse_item_id = NEW.warehouse_item_id
          AND location_id = NEW.from_location_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Không tìm thấy tồn kho: item % tại vị trí %',
                NEW.warehouse_item_id, NEW.from_location_id;
        END IF;

        IF v_current_qty < NEW.qty_change THEN
            RAISE EXCEPTION 'Tồn kho không đủ: hiện có % nhưng cần xuất %',
                v_current_qty, NEW.qty_change;
        END IF;

        UPDATE warehouse_stock
        SET qty_on_hand   = qty_on_hand - NEW.qty_change,
            last_updated_at = NOW()
        WHERE warehouse_item_id = NEW.warehouse_item_id
          AND location_id = NEW.from_location_id;
    END IF;

    -- ── Nhập vào to_location ─────────────────────────────────
    IF NEW.to_location_id IS NOT NULL THEN
        INSERT INTO warehouse_stock
            (warehouse_item_id, location_id, farm_id, qty_on_hand, last_updated_at)
        VALUES
            (NEW.warehouse_item_id, NEW.to_location_id, NEW.farm_id, NEW.qty_change, NOW())
        ON CONFLICT (warehouse_item_id, location_id)
        DO UPDATE SET
            qty_on_hand     = warehouse_stock.qty_on_hand + NEW.qty_change,
            last_updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT ON warehouse_transactions
FOR EACH ROW EXECUTE FUNCTION fn_update_stock();

COMMENT ON FUNCTION fn_update_stock() IS
    'Cập nhật warehouse_stock sau INSERT warehouse_transactions. '
    'Dùng SELECT FOR UPDATE để tránh race condition khi xuất kho đồng thời. '
    'Raise exception nếu tồn không đủ — bắt DataIntegrityViolationException ở Spring layer.';


-- ============================================================
-- 50. TASK MATERIALS
-- ============================================================
CREATE TABLE task_materials (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id           UUID NOT NULL REFERENCES tasks(id),
    warehouse_item_id UUID NOT NULL REFERENCES warehouse_items(id),
    planned_qty       DECIMAL(10,3) NOT NULL,
    unit_id           UUID NOT NULL REFERENCES units(id),
    CONSTRAINT chk_planned_qty_positive CHECK (planned_qty > 0)
);
CREATE INDEX idx_task_materials_task ON task_materials(task_id);
CREATE INDEX idx_task_materials_item ON task_materials(warehouse_item_id);


-- ============================================================
-- 51. WORK LOG MATERIALS
-- ============================================================
CREATE TABLE work_log_materials (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_log_id       UUID          NOT NULL REFERENCES work_logs(id),
    warehouse_item_id UUID          NOT NULL REFERENCES warehouse_items(id),
    warehouse_location_id       UUID          REFERENCES warehouse_locations(id),
    used_qty          DECIMAL(10,3) NOT NULL,
    deviation_reason  TEXT,
    CONSTRAINT chk_used_qty_positive CHECK (used_qty > 0)
);
CREATE INDEX idx_wlm_work_log ON work_log_materials(work_log_id);
CREATE INDEX idx_wlm_item     ON work_log_materials(warehouse_item_id);


-- ============================================================
-- 52. QUALITY GRADES (global lookup)
-- ============================================================
CREATE TABLE quality_grades (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    order_index SMALLINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE quality_grades IS
    'Global — system quản lý. Seed data: A, B, C, Loại thải.';


-- ============================================================
-- 53. HARVEST RECORDS
-- ============================================================
CREATE TABLE harvest_records (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                  UUID NOT NULL REFERENCES plans(id),
    plan_stage_id            UUID REFERENCES plan_stages(id),
    farm_id                  UUID NOT NULL REFERENCES farms(id),
    plot_id                  UUID REFERENCES plots(id),
    harvest_date             DATE          NOT NULL,
    batch_number             SMALLINT      NOT NULL DEFAULT 1,
    quantity                 DECIMAL(10,3) NOT NULL,
    unit_id                  UUID          NOT NULL REFERENCES units(id),
    quality_grade_id         UUID          REFERENCES quality_grades(id),
    unit_price               DECIMAL(15,2),
    estimated_revenue        DECIMAL(15,2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,
    harvested_by             UUID REFERENCES users(id),
    is_early_harvest         BOOLEAN NOT NULL DEFAULT FALSE,
    early_harvest_reason     TEXT,
    is_partial               BOOLEAN NOT NULL DEFAULT FALSE,
    warehouse_item_id        UUID REFERENCES warehouse_items(id),
    warehouse_location_id    UUID REFERENCES warehouse_locations(id),
    warehouse_transaction_id UUID REFERENCES warehouse_transactions(id),
    notes                    TEXT,
    created_by               UUID NOT NULL REFERENCES users(id),
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_harvest_qty_positive   CHECK (quantity > 0),
    CONSTRAINT chk_harvest_batch_positive CHECK (batch_number > 0),
    CONSTRAINT chk_early_harvest_reason   CHECK (
        is_early_harvest = FALSE OR early_harvest_reason IS NOT NULL
    )
);
CREATE INDEX idx_harvest_plan ON harvest_records(plan_id, harvest_date);
CREATE INDEX idx_harvest_farm ON harvest_records(farm_id, harvest_date DESC);
CREATE INDEX idx_harvest_plot ON harvest_records(plot_id, harvest_date);

-- FK vòng: warehouse_transactions.ref_harvest_id → harvest_records
ALTER TABLE warehouse_transactions
    ADD CONSTRAINT fk_wt_harvest
    FOREIGN KEY (ref_harvest_id) REFERENCES harvest_records(id);


-- ============================================================
-- 54. HARVEST IMAGES
-- ============================================================
CREATE TABLE harvest_images (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    harvest_record_id UUID     NOT NULL REFERENCES harvest_records(id),
    farm_id           UUID     NOT NULL REFERENCES farms(id),
    image_url         TEXT     NOT NULL,
    order_index       SMALLINT NOT NULL DEFAULT 0,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_harvest_images_record ON harvest_images(harvest_record_id);
CREATE INDEX idx_harvest_images_farm   ON harvest_images(farm_id);


-- ============================================================
-- 55. DIAGNOSES
-- [ENUM-3] diagnosis_source enum
-- [ENUM-4] diagnosis_status enum
-- ============================================================
CREATE TABLE diagnoses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id      UUID NOT NULL REFERENCES farms(id),
    plot_id      UUID REFERENCES plots(id),
    crop_id      UUID REFERENCES crops(id),
    requested_by UUID NOT NULL REFERENCES users(id),
    source       diagnosis_source NOT NULL,
    disease_name VARCHAR(200),
    severity     severity_level,
    confidence   DECIMAL(4,3),
    treatment    TEXT,
    alternatives JSONB,
    needs_expert BOOLEAN          NOT NULL DEFAULT FALSE,
    ai_model     VARCHAR(50)      NOT NULL,
    status       diagnosis_status NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP        NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    deleted_at   TIMESTAMP,
    CONSTRAINT chk_confidence CHECK (confidence >= 0 AND confidence <= 1)
);
CREATE INDEX idx_diagnoses_farm   ON diagnoses(farm_id, created_at DESC);
CREATE INDEX idx_diagnoses_status ON diagnoses(status) WHERE status = 'PENDING';


-- ============================================================
-- 56. DIAGNOSIS IMAGES
-- ============================================================
CREATE TABLE diagnosis_images (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnosis_id UUID     NOT NULL REFERENCES diagnoses(id),
    image_url    TEXT     NOT NULL,
    order_index  SMALLINT NOT NULL
);
CREATE INDEX idx_diagnosis_images_diag ON diagnosis_images(diagnosis_id);


-- ============================================================
-- 57. DISEASE REPORTS
-- [ENUM-5] disease_report_source enum
-- ============================================================
CREATE TABLE disease_reports (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id          UUID NOT NULL REFERENCES farms(id),
    task_id          UUID REFERENCES tasks(id),
    plot_id          UUID REFERENCES plots(id),
    reported_by      UUID NOT NULL REFERENCES users(id),
    source           disease_report_source NOT NULL,
    location_notes   VARCHAR(500),
    affected_percent DECIMAL(5,2),
    description      TEXT,
    diagnosis_id     UUID REFERENCES diagnoses(id),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_report_has_context CHECK (task_id IS NOT NULL OR plot_id IS NOT NULL),
    CONSTRAINT chk_affected_percent   CHECK (affected_percent IS NULL OR
        (affected_percent >= 0 AND affected_percent <= 100))
);
CREATE INDEX idx_disease_reports_farm ON disease_reports(farm_id, created_at DESC);





-- ============================================================
-- EMPLOYEE WAGE CONFIGS
-- Cấu hình lương theo ngày công cho từng nhân công trong farm.
-- Lưu lịch sử thay đổi lương qua effective_from / effective_to.
-- Lương tại thời điểm T = row có effective_from <= T
--   AND (effective_to IS NULL OR effective_to > T).
-- ============================================================
CREATE TABLE employee_wage_configs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id        UUID NOT NULL REFERENCES farms(id),
    user_id        UUID NOT NULL REFERENCES users(id),
    daily_rate     DECIMAL(15,2) NOT NULL,
    -- Lương 1 ngày công (đơn vị: VND hoặc currency của farm)
    ot_multiplier  DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    -- Hệ số OT: lương OT = daily_rate × coefficient × ot_multiplier
    -- VD: 1.5 = tính 150% ngày công bình thường
    effective_from DATE NOT NULL,        -- Áp dụng từ ngày này
    effective_to   DATE,                 -- NULL = đang áp dụng hiện tại
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, user_id, effective_from),
    CONSTRAINT chk_effective     CHECK (effective_to IS NULL OR effective_to > effective_from),
    CONSTRAINT chk_daily_rate    CHECK (daily_rate > 0),
    CONSTRAINT chk_ot_multiplier CHECK (ot_multiplier >= 1)
);
COMMENT ON TABLE employee_wage_configs IS
    'Lịch sử cấu hình lương theo ngày công của từng nhân công. '
    'Khi tăng/giảm lương: UPDATE effective_to = ngày hiệu lực mới - 1 cho row cũ, '
    'INSERT row mới với effective_from = ngày hiệu lực mới. '
    'Tính lương work_log: lấy config có effective_from <= work_date '
    'AND (effective_to IS NULL OR effective_to >= work_date).';
COMMENT ON COLUMN employee_wage_configs.daily_rate IS
    'Lương 1 ngày công đầy đủ (coefficient = 1.0). '
    'Lương thực nhận mỗi work_log = daily_rate × shift.coefficient '
    '× CASE WHEN is_overtime THEN ot_multiplier ELSE 1.0 END.';


-- ============================================================
-- 58. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    farm_id    UUID REFERENCES farms(id),
    type       VARCHAR(50)  NOT NULL,
    title      VARCHAR(200) NOT NULL,
    body       TEXT         NOT NULL,
    data       JSONB,
    is_read    BOOLEAN   NOT NULL DEFAULT FALSE,
    read_at    TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;


-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW harvest_summary AS
SELECT
    hr.plan_id,
    hr.farm_id,
    hr.plot_id,
    COUNT(*)                     AS total_batches,
    SUM(hr.quantity)             AS total_quantity,
    hr.unit_id,
    SUM(hr.estimated_revenue)    AS total_revenue,
    MIN(hr.harvest_date)         AS first_harvest_date,
    MAX(hr.harvest_date)         AS last_harvest_date,
    BOOL_OR(hr.is_early_harvest) AS has_early_harvest,
    BOOL_OR(hr.is_partial)       AS has_partial_harvest
FROM harvest_records hr
GROUP BY hr.plan_id, hr.farm_id, hr.plot_id, hr.unit_id;
COMMENT ON VIEW harvest_summary IS
    'Tổng hợp per plan. Nếu 1 plan dùng nhiều unit → nhiều row.';

CREATE VIEW low_stock_alert AS
SELECT
    ws.farm_id,
    ws.warehouse_item_id,
    wi.name          AS item_name,
    wi.warehouse_id,
    wh.name          AS warehouse_name,
    ws.location_id,
    wl.name          AS location_name,
    ws.qty_on_hand,
    wi.min_stock_qty,
    u.code           AS unit_code
FROM warehouse_stock ws
JOIN warehouse_items     wi ON wi.id = ws.warehouse_item_id
JOIN warehouses          wh ON wh.id = wi.warehouse_id
JOIN warehouse_locations wl ON wl.id = ws.location_id
JOIN units               u  ON u.id  = wi.unit_id
WHERE wi.min_stock_qty IS NOT NULL
  AND ws.qty_on_hand <= wi.min_stock_qty
  AND wi.deleted_at IS NULL;
COMMENT ON VIEW low_stock_alert IS
    'Item tồn kho ≤ min_stock_qty. Dùng cho dashboard và notification job.';


-- ============================================================
-- HELPER FUNCTIONS (RLS)
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
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms FORCE ROW LEVEL SECURITY;
CREATE POLICY farms_select ON farms FOR SELECT
    USING (
        owner_id = current_app_user_id()
        OR id IN (
            SELECT farm_id FROM farm_members
            WHERE user_id = current_app_user_id() AND is_active = TRUE
        )
    );
CREATE POLICY farms_modify ON farms FOR ALL
    USING (owner_id = current_app_user_id());

-- Tất cả bảng farm-scoped (farm_id trực tiếp)
DO $$ DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'farm_configs','farm_members','farm_subscriptions','subscription_history',
    'payment_transactions','invitations','plots','soil_records','soil_ai_results',
    'plan_stage_status_transitions','task_status_transitions',
    'plans','plan_stage_status_histories',
    'tasks','work_logs','warehouses','warehouse_locations',
    'warehouse_items','warehouse_stock','warehouse_transactions',
    'harvest_records','harvest_images','diagnoses',
    'disease_reports','notifications'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY %I_iso ON %I USING (farm_id = current_farm_id())',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Bảng cần policy riêng (không có farm_id trực tiếp hoặc có logic đặc biệt)
ALTER TABLE plan_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_stages FORCE ROW LEVEL SECURITY;
CREATE POLICY plan_stages_iso ON plan_stages
    USING (plan_id IN (SELECT id FROM plans WHERE farm_id = current_farm_id()));

ALTER TABLE task_status_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_histories FORCE ROW LEVEL SECURITY;
CREATE POLICY tsh_iso ON task_status_histories
    USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies FORCE ROW LEVEL SECURITY;
CREATE POLICY task_deps_iso ON task_dependencies
    USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees FORCE ROW LEVEL SECURITY;
CREATE POLICY task_assignees_iso ON task_assignees
    USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

ALTER TABLE task_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_materials FORCE ROW LEVEL SECURITY;
CREATE POLICY task_materials_iso ON task_materials
    USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

ALTER TABLE task_skip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_skip_days FORCE ROW LEVEL SECURITY;
CREATE POLICY task_skip_days_iso ON task_skip_days
    USING (task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id()));

ALTER TABLE work_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_images FORCE ROW LEVEL SECURITY;
CREATE POLICY work_log_images_iso ON work_log_images
    USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

ALTER TABLE work_log_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_materials FORCE ROW LEVEL SECURITY;
CREATE POLICY work_log_materials_iso ON work_log_materials
    USING (work_log_id IN (SELECT id FROM work_logs WHERE farm_id = current_farm_id()));

ALTER TABLE crop_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stages FORCE ROW LEVEL SECURITY;
CREATE POLICY crop_stages_visibility ON crop_stages FOR SELECT
    USING (crop_id IN (
        SELECT id FROM crops WHERE scope = 'SYSTEM' OR farm_id = current_farm_id()
    ));
CREATE POLICY crop_stages_modify ON crop_stages FOR ALL
    USING (crop_id IN (
        SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id()
    ));

ALTER TABLE crop_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_conditions FORCE ROW LEVEL SECURITY;
CREATE POLICY crop_conditions_visibility ON crop_conditions FOR SELECT
    USING (crop_id IN (
        SELECT id FROM crops WHERE scope = 'SYSTEM' OR farm_id = current_farm_id()
    ));
CREATE POLICY crop_conditions_modify ON crop_conditions FOR ALL
    USING (crop_id IN (
        SELECT id FROM crops WHERE scope = 'FARM' AND farm_id = current_farm_id()
    ));

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops FORCE ROW LEVEL SECURITY;
CREATE POLICY crops_visibility ON crops FOR SELECT
    USING (scope = 'SYSTEM' OR farm_id = current_farm_id());
CREATE POLICY crops_modify ON crops FOR ALL
    USING (scope = 'FARM' AND farm_id = current_farm_id());

ALTER TABLE diagnosis_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_images FORCE ROW LEVEL SECURITY;
CREATE POLICY diagnosis_images_iso ON diagnosis_images
    USING (diagnosis_id IN (SELECT id FROM diagnoses WHERE farm_id = current_farm_id()));

-- plan_stage_status_transitions & task_status_transitions: global + farm override
ALTER TABLE plan_stage_status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_stage_status_transitions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS plan_stage_status_transitions_iso ON plan_stage_status_transitions;
CREATE POLICY psst_visibility ON plan_stage_status_transitions FOR SELECT
    USING (farm_id IS NULL OR farm_id = current_farm_id());
CREATE POLICY psst_modify ON plan_stage_status_transitions FOR ALL
    USING (farm_id = current_farm_id());

ALTER TABLE task_status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_transitions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS task_status_transitions_iso ON task_status_transitions;
CREATE POLICY tst_visibility ON task_status_transitions FOR SELECT
    USING (farm_id IS NULL OR farm_id = current_farm_id());
CREATE POLICY tst_modify ON task_status_transitions FOR ALL
    USING (farm_id = current_farm_id());

-- notifications: user-scoped + farm-scoped
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_iso ON notifications;
CREATE POLICY notifications_iso ON notifications
    USING (
        user_id = current_app_user_id()
        AND (farm_id IS NULL OR current_farm_id() IS NULL OR farm_id = current_farm_id())
    );

-- audit_logs: read-only farm isolation, INSERT chỉ service role
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_iso ON audit_logs FOR SELECT
    USING (farm_id = current_farm_id() OR farm_id IS NULL);


-- ============================================================
-- SERVICE LAYER NOTES
-- ============================================================

-- [plan.plot thuộc farm — FIX-4]
--   Vì bỏ composite FK, enforce ở service layer:
--   SELECT id FROM plots
--   WHERE id = $plot_id AND farm_id = $farm_id AND deleted_at IS NULL
--   → Không tìm thấy → reject 422 trước khi INSERT plan

-- [TRANSFER flow]
--   BEGIN;
--     INSERT INTO warehouse_transactions (..., type='TRANSFER_OUT', from_location_id=$src)
--     RETURNING id INTO v_out_id;
--     INSERT INTO warehouse_transactions (..., type='TRANSFER_IN', to_location_id=$dst,
--       ref_transfer_id=v_out_id) RETURNING id INTO v_in_id;
--     UPDATE warehouse_transactions SET ref_transfer_id = v_in_id WHERE id = v_out_id;
--   COMMIT;

-- [HARVEST_IN flow]
--   BEGIN;
--     INSERT INTO harvest_records (...) RETURNING id INTO v_hr_id;
--     INSERT INTO warehouse_transactions (..., type='HARVEST_IN',
--       to_location_id=$loc, ref_harvest_id=v_hr_id);
--   COMMIT;

-- [Tồn kho âm]
--   Trigger raise exception → Spring bắt PSQLException (SQLState 'P0001')
--   → return 409 CONFLICT với message từ exception

-- [plans status machine]
--   DRAFT → ACTIVE
--   ACTIVE → READY_TO_HARVEST (tự động khi tất cả stage terminal,
--             hoặc thủ công khi farm muốn thu sớm)
--   READY_TO_HARVEST → HARVESTING (khi INSERT harvest_record đầu tiên)
--   HARVESTING → COMPLETED (farm xác nhận)
--   Bất kỳ → CANCELLED

-- [RLS - Spring Boot / HikariCP]
--   @Transactional interceptor:
--   SET LOCAL app.current_farm_id = '<uuid>';
--   SET LOCAL app.current_user_id = '<uuid>';
--   SET LOCAL tự reset khi COMMIT/ROLLBACK

-- [harvest batch_number]
--   SELECT COALESCE(MAX(batch_number), 0) + 1
--   FROM harvest_records WHERE plan_id = $plan_id

-- [low_stock notification]
--   SELECT * FROM low_stock_alert WHERE farm_id = $farm_id
--   → Gửi notification nếu chưa gửi trong 24h

-- [Enum thêm value mới]
--   ALTER TYPE plan_status ADD VALUE 'SUSPENDED';  -- không cần ROLLBACK
--   Lưu ý: ADD VALUE không thể trong transaction block ở PostgreSQL < 14
--   PostgreSQL 14+: có thể dùng trong transaction với IF NOT EXISTS