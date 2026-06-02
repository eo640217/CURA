CREATE TABLE organizations (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Default org so V12 can backfill existing rows
INSERT INTO organizations (name) VALUES ('Default Organization');
