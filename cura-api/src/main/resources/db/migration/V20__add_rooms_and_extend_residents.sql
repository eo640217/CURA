-- ── rooms table ─────────────────────────────────────────────────────────────
CREATE TABLE rooms (
    id          BIGSERIAL    PRIMARY KEY,
    room_number VARCHAR(20)  NOT NULL,
    unit_id     BIGINT       NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    bed_count   INT          NOT NULL DEFAULT 1,
    is_occupied BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE(room_number, unit_id)
);

CREATE INDEX idx_rooms_unit_id ON rooms(unit_id);

-- ── new columns on residents ──────────────────────────────────────────────────
ALTER TABLE residents ADD COLUMN IF NOT EXISTS condition               VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS care_level              VARCHAR(50);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS status                  VARCHAR(50) DEFAULT 'STABLE';
ALTER TABLE residents ADD COLUMN IF NOT EXISTS gp_name                 VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS emergency_contact_name  VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS room_id                 BIGINT REFERENCES rooms(id) ON DELETE SET NULL;

-- unit_id already added in V13 — skipping
