ALTER TABLE residents ADD COLUMN IF NOT EXISTS gender                         VARCHAR(50);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS admission_date                 DATE;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS nhs_number                     VARCHAR(20);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE residents ADD COLUMN IF NOT EXISTS care_plan                      VARCHAR(255);
