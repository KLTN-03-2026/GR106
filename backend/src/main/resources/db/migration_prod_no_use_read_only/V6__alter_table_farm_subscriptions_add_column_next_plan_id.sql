ALTER TABLE farm_subscriptions
ADD COLUMN IF NOT EXISTS next_plan_id UUID REFERENCES subscription_plans(id)