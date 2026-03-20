CREATE TABLE IF NOT EXISTS resident_notes (
  id BIGSERIAL PRIMARY KEY,
  resident_id BIGINT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(120)
    );

CREATE INDEX IF NOT EXISTS idx_resident_notes_resident_id_created_at
    ON resident_notes (resident_id, created_at DESC);