-- facility_id predates unit-based residency (V13) and is no longer mapped
-- by the Resident entity, which derives facility via unit.facility. The
-- NOT NULL was never relaxed, so every insert through the unit-scoped
-- create endpoint fails. Guarded because some dev databases already
-- dropped the column out-of-band, ahead of this migration.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'residents' AND column_name = 'facility_id'
    ) THEN
        ALTER TABLE residents ALTER COLUMN facility_id DROP NOT NULL;
    END IF;
END $$;
