ALTER TABLE plan_stages
ADD COLUMN updated_at TIMESTAMP

ALTER TABLE plan_stages
ADD COLUMN updated_by UUID REFERENCES users(id)

ALTER TABLE plan_stages
ADD COLUMN deleted_at TIMESTAMP


ALTER TABLE plan_stages
ADD COLUMN created_at TIMESTAMP

ALTER TABLE plan_stages
ADD COLUMN deleted_by UUID REFERENCES users(id)

ALTER TABLE plan_stages
ADD COLUMN deleted_at TIMESTAMP
