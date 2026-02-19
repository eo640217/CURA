ALTER TABLE facilities
    ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
