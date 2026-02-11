CREATE TABLE IF NOT EXISTS app_meta (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    note TEXT NOT NULL
    );

INSERT INTO app_meta(note) VALUES ('cura backend initialized');
