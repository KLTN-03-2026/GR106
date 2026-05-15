DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID        NOT NULL,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    reference_id    UUID,
    reference_type  VARCHAR(50),
    is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE plan_stages
DROP COLUMN ai_suggestion_cache;

ALTER TABLE plan_stages
DROP COLUMN ai_cached_at;

CREATE TABLE plan_stage_ai_suggestion_cache(
    id UUID PRIMARY KEY default gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id),
    plan_stage_id UUID NOT NULL REFERENCES plan_stages(id),
    title TEXT,
    description TEXT,
    priority SMALLINT,
    estimated_days SMALLINT,
    category VARCHAR(20),
    created_at TIMESTAMP NOT NULL
);

