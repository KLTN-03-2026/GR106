ALTER TYPE subscription_status ADD VALUE 'PENDING';

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS billing_cycle billing_cycle NOT NULL;
