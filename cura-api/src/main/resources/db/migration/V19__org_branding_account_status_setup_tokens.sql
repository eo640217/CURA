-- ── Organization branding ────────────────────────────────────────────────────
ALTER TABLE organizations
    ADD COLUMN logo_url      VARCHAR(500),
    ADD COLUMN primary_color VARCHAR(7),
    ADD COLUMN plan_tier     VARCHAR(30) NOT NULL DEFAULT 'TRIAL';

-- ── User account status ───────────────────────────────────────────────────────
ALTER TABLE app_user
    ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- ── Setup tokens ──────────────────────────────────────────────────────────────
CREATE TABLE setup_tokens (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64)  NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_setup_tokens_hash    ON setup_tokens(token_hash);
CREATE INDEX idx_setup_tokens_user    ON setup_tokens(user_id);
