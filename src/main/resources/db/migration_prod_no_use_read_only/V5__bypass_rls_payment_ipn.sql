-- V_XX__bypass_rls_payment_ipn.sql

-- Tạo policy cho phép đọc/update payment_transactions khi không có farm context
-- (dành cho IPN server-to-server callback)

DROP POLICY IF EXISTS payment_transactions_select ON payment_transactions;
DROP POLICY IF EXISTS payment_transactions_update ON payment_transactions;

-- SELECT: cho phép khi có farm_id context HOẶC khi query theo order_code (IPN)
CREATE POLICY payment_transactions_select ON payment_transactions
FOR SELECT USING (
    farm_id = current_farm_id()
    OR current_setting('app.bypass_rls', TRUE) = 'true'
);

CREATE POLICY payment_transactions_update ON payment_transactions
FOR UPDATE USING (
    farm_id = current_farm_id()
    OR current_setting('app.bypass_rls', TRUE) = 'true'
)
WITH CHECK (
    farm_id = current_farm_id()
    OR current_setting('app.bypass_rls', TRUE) = 'true'
);