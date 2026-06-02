ALTER TABLE residents
    ADD COLUMN unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL;

CREATE INDEX idx_residents_unit_id ON residents(unit_id);
