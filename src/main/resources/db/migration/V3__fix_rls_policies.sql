-- farm_subscriptions
DROP POLICY IF EXISTS farm_subscriptions_select ON farm_subscriptions;
DROP POLICY IF EXISTS farm_subscriptions_insert ON farm_subscriptions;
DROP POLICY IF EXISTS farm_subscriptions_update ON farm_subscriptions;
DROP POLICY IF EXISTS farm_subscriptions_delete ON farm_subscriptions;

CREATE POLICY farm_subscriptions_select ON farm_subscriptions FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY farm_subscriptions_insert ON farm_subscriptions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms
            WHERE id = farm_id
            AND owner_id = current_app_user_id()
        )
    );

CREATE POLICY farm_subscriptions_update ON farm_subscriptions FOR UPDATE
    USING (farm_id = current_farm_id());

CREATE POLICY farm_subscriptions_delete ON farm_subscriptions FOR DELETE
    USING (farm_id = current_farm_id());


-- subscription_history
DROP POLICY IF EXISTS subscription_history_select ON subscription_history;
DROP POLICY IF EXISTS subscription_history_insert ON subscription_history;
DROP POLICY IF EXISTS subscription_history_update ON subscription_history;
DROP POLICY IF EXISTS subscription_history_delete ON subscription_history;

CREATE POLICY subscription_history_select ON subscription_history FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY subscription_history_insert ON subscription_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms
            WHERE id = farm_id
            AND owner_id = current_app_user_id()
        )
    );

CREATE POLICY subscription_history_update ON subscription_history FOR UPDATE
    USING (farm_id = current_farm_id());

CREATE POLICY subscription_history_delete ON subscription_history FOR DELETE
    USING (FALSE);


-- farm_members
DROP POLICY IF EXISTS farm_members_iso ON farm_members;
DROP POLICY IF EXISTS farm_members_select ON farm_members;
DROP POLICY IF EXISTS farm_members_insert ON farm_members;
DROP POLICY IF EXISTS farm_members_update ON farm_members;
DROP POLICY IF EXISTS farm_members_delete ON farm_members;

CREATE POLICY farm_members_select ON farm_members FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY farm_members_insert ON farm_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms
            WHERE id = farm_id
            AND owner_id = current_app_user_id()
        )
        OR farm_id = current_farm_id()
    );

CREATE POLICY farm_members_update ON farm_members FOR UPDATE
    USING (farm_id = current_farm_id());

CREATE POLICY farm_members_delete ON farm_members FOR DELETE
    USING (farm_id = current_farm_id());


-- farm_configs
DROP POLICY IF EXISTS farm_configs_iso ON farm_configs;
DROP POLICY IF EXISTS farm_configs_select ON farm_configs;
DROP POLICY IF EXISTS farm_configs_insert ON farm_configs;
DROP POLICY IF EXISTS farm_configs_update ON farm_configs;

CREATE POLICY farm_configs_select ON farm_configs FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY farm_configs_insert ON farm_configs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms
            WHERE id = farm_id
            AND owner_id = current_app_user_id()
        )
    );

CREATE POLICY farm_configs_update ON farm_configs FOR UPDATE
    USING (farm_id = current_farm_id());


-- audit_logs
DROP POLICY IF EXISTS audit_logs_iso ON audit_logs;
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;

CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
    USING (farm_id = current_farm_id() OR farm_id IS NULL);

CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
    WITH CHECK (TRUE);


-- work_shifts
DROP POLICY IF EXISTS work_shifts_select ON work_shifts;
DROP POLICY IF EXISTS work_shifts_insert ON work_shifts;
DROP POLICY IF EXISTS work_shifts_update ON work_shifts;
DROP POLICY IF EXISTS work_shifts_delete ON work_shifts;

ALTER TABLE work_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_shifts FORCE ROW LEVEL SECURITY;

CREATE POLICY work_shifts_select ON work_shifts FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY work_shifts_insert ON work_shifts FOR INSERT
    WITH CHECK (farm_id = current_farm_id());

CREATE POLICY work_shifts_update ON work_shifts FOR UPDATE
    USING (farm_id = current_farm_id());

CREATE POLICY work_shifts_delete ON work_shifts FOR DELETE
    USING (farm_id = current_farm_id());


-- employee_wage_configs
DROP POLICY IF EXISTS employee_wage_configs_select ON employee_wage_configs;
DROP POLICY IF EXISTS employee_wage_configs_insert ON employee_wage_configs;
DROP POLICY IF EXISTS employee_wage_configs_update ON employee_wage_configs;
DROP POLICY IF EXISTS employee_wage_configs_delete ON employee_wage_configs;

ALTER TABLE employee_wage_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_wage_configs FORCE ROW LEVEL SECURITY;

CREATE POLICY employee_wage_configs_select ON employee_wage_configs FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY employee_wage_configs_insert ON employee_wage_configs FOR INSERT
    WITH CHECK (farm_id = current_farm_id());

CREATE POLICY employee_wage_configs_update ON employee_wage_configs FOR UPDATE
    USING (farm_id = current_farm_id());

CREATE POLICY employee_wage_configs_delete ON employee_wage_configs FOR DELETE
    USING (farm_id = current_farm_id());


-- plan_plots
DROP POLICY IF EXISTS plan_plots_select ON plan_plots;
DROP POLICY IF EXISTS plan_plots_insert ON plan_plots;
DROP POLICY IF EXISTS plan_plots_update ON plan_plots;
DROP POLICY IF EXISTS plan_plots_delete ON plan_plots;

ALTER TABLE plan_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_plots FORCE ROW LEVEL SECURITY;

CREATE POLICY plan_plots_select ON plan_plots FOR SELECT
    USING (farm_id = current_farm_id());

CREATE POLICY plan_plots_insert ON plan_plots FOR INSERT
    WITH CHECK (farm_id = current_farm_id());

CREATE POLICY plan_plots_update ON plan_plots FOR UPDATE
    USING (farm_id = current_farm_id());

CREATE POLICY plan_plots_delete ON plan_plots FOR DELETE
    USING (farm_id = current_farm_id());