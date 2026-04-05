-- ============================================================
-- 1. HELPER FUNCTIONS (SAFE)
-- ============================================================

CREATE OR REPLACE FUNCTION current_farm_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_farm_id', TRUE)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', TRUE)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 2. FARMS (LOGIN SAFE)
-- ============================================================

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farms_select ON farms;
DROP POLICY IF EXISTS farms_insert ON farms;
DROP POLICY IF EXISTS farms_update ON farms;
DROP POLICY IF EXISTS farms_delete ON farms;

-- 🔥 LOGIN SAFE: chưa chọn farm vẫn query được
CREATE POLICY farms_select ON farms
FOR SELECT
USING (
    owner_id = current_app_user_id()
    OR id IN (
        SELECT farm_id FROM farm_members
        WHERE user_id = current_app_user_id()
        AND is_active = TRUE
    )
);

CREATE POLICY farms_insert ON farms
FOR INSERT
WITH CHECK (owner_id = current_app_user_id());

CREATE POLICY farms_update ON farms
FOR UPDATE
USING (owner_id = current_app_user_id());

CREATE POLICY farms_delete ON farms
FOR DELETE
USING (owner_id = current_app_user_id());

-- ============================================================
-- 3. FARM MEMBERS (LOGIN SAFE)
-- ============================================================

ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farm_members_select ON farm_members;
DROP POLICY IF EXISTS farm_members_insert ON farm_members;
DROP POLICY IF EXISTS farm_members_update ON farm_members;
DROP POLICY IF EXISTS farm_members_delete ON farm_members;

-- 🔥 cho login phase
CREATE POLICY farm_members_select ON farm_members
FOR SELECT
USING (
    user_id = current_app_user_id()
    OR farm_id = current_farm_id()
);

CREATE POLICY farm_members_insert ON farm_members
FOR INSERT
WITH CHECK (
    farm_id = current_farm_id()
);

CREATE POLICY farm_members_update ON farm_members
FOR UPDATE
USING (farm_id = current_farm_id());

CREATE POLICY farm_members_delete ON farm_members
FOR DELETE
USING (farm_id = current_farm_id());

-- ============================================================
-- 4. FARM CONFIGS
-- ============================================================

ALTER TABLE farm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_configs FORCE ROW LEVEL SECURITY;

CREATE POLICY farm_configs_select ON farm_configs
FOR SELECT USING (farm_id = current_farm_id());

CREATE POLICY farm_configs_insert ON farm_configs
FOR INSERT WITH CHECK (farm_id = current_farm_id());

CREATE POLICY farm_configs_update ON farm_configs
FOR UPDATE USING (farm_id = current_farm_id());

-- ============================================================
-- 5. SUBSCRIPTIONS (OWNER + MEMBER)
-- ============================================================

ALTER TABLE farm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_subscriptions FORCE ROW LEVEL SECURITY;

CREATE POLICY farm_subscriptions_select ON farm_subscriptions
FOR SELECT USING (farm_id = current_farm_id());

CREATE POLICY farm_subscriptions_insert ON farm_subscriptions
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM farms f
        WHERE f.id = farm_id
        AND (
            f.owner_id = current_app_user_id()
            OR EXISTS (
                SELECT 1 FROM farm_members fm
                WHERE fm.farm_id = f.id
                AND fm.user_id = current_app_user_id()
                AND fm.is_active = TRUE
            )
        )
    )
);

CREATE POLICY farm_subscriptions_update ON farm_subscriptions
FOR UPDATE USING (farm_id = current_farm_id());

CREATE POLICY farm_subscriptions_delete ON farm_subscriptions
FOR DELETE USING (farm_id = current_farm_id());

-- ============================================================
-- 6. SUBSCRIPTION HISTORY
-- ============================================================

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history FORCE ROW LEVEL SECURITY;

CREATE POLICY subscription_history_select ON subscription_history
FOR SELECT USING (farm_id = current_farm_id());

CREATE POLICY subscription_history_insert ON subscription_history
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM farms f
        WHERE f.id = farm_id
        AND (
            f.owner_id = current_app_user_id()
            OR EXISTS (
                SELECT 1 FROM farm_members fm
                WHERE fm.farm_id = f.id
                AND fm.user_id = current_app_user_id()
                AND fm.is_active = TRUE
            )
        )
    )
);

CREATE POLICY subscription_history_update ON subscription_history
FOR UPDATE USING (farm_id = current_farm_id());

CREATE POLICY subscription_history_delete ON subscription_history
FOR DELETE USING (FALSE);

-- ============================================================
-- 7. GENERIC FARM TABLES (STRICT)
-- ============================================================

DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'plots','tasks','work_logs','warehouses',
    'warehouse_items','warehouse_stock','warehouse_transactions',
    'harvest_records','diagnoses','notifications'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_update ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_delete ON %I', tbl, tbl);

    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT USING (farm_id = current_farm_id())',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (farm_id = current_farm_id())',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE USING (farm_id = current_farm_id())',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE USING (farm_id = current_farm_id())',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- 8. RELATION TABLES (NO farm_id)
-- ============================================================

ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees FORCE ROW LEVEL SECURITY;

CREATE POLICY task_assignees_select ON task_assignees
FOR SELECT
USING (
    task_id IN (SELECT id FROM tasks WHERE farm_id = current_farm_id())
);

-- ============================================================
-- DONE
-- ============================================================