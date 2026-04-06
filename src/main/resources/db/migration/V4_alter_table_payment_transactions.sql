ALTER TABLE payment_transactions
ADD COLUMN order_code VARCHAR(100),
ADD COLUMN gateway_response_code VARCHAR(10),
ADD COLUMN gateway_response_message TEXT,
ADD COLUMN bank_code VARCHAR(20),
ADD COLUMN paid_amount DECIMAL(15,2),
ADD COLUMN raw_response JSONB,
ALTER COLUMN expired_at SET DEFAULT (NOW() + INTERVAL '15 minutes');

ALTER TABLE payment_transactions
ADD CONSTRAINT uk_payment_order_code UNIQUE (order_code);

CREATE INDEX idx_payment_order_code
ON payment_transactions(order_code);

CREATE INDEX idx_payment_gateway_txn
ON payment_transactions(gateway, gateway_txn_id);