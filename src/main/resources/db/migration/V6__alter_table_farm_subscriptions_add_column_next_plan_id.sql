ALTER TABLE farm_subscriptions
ADD COLUMN IF NOT EXISTS next_plan_id REFERENCES subscription_plans(id)