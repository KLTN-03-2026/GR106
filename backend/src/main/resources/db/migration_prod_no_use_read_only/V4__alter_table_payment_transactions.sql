-- Thêm cột nếu chưa có
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS order_code VARCHAR(100);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS gateway_response_code VARCHAR(10);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS gateway_response_message TEXT;

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS raw_response JSONB;

-- Sửa default cho expired_at
ALTER TABLE payment_transactions
ALTER COLUMN expired_at SET DEFAULT (NOW() + INTERVAL '15 minutes');

-- Thêm constraint nếu chưa có (Postgres không có IF NOT EXISTS cho constraint)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_payment_order_code'
    ) THEN
        ALTER TABLE payment_transactions
        ADD CONSTRAINT uk_payment_order_code UNIQUE (order_code);
    END IF;
END$$;

-- Tạo index nếu chưa có
CREATE INDEX IF NOT EXISTS idx_payment_order_code
ON payment_transactions(order_code);

CREATE INDEX IF NOT EXISTS idx_payment_gateway_txn
ON payment_transactions(gateway, gateway_txn_id);
