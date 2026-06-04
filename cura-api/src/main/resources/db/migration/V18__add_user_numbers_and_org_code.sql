-- ── Organizations: org_code ──────────────────────────────────────────────────
ALTER TABLE organizations ADD COLUMN org_code VARCHAR(20);

-- Backfill: safe slug from id
UPDATE organizations
SET org_code = 'ORG' || LPAD(id::text, 3, '0');

ALTER TABLE organizations ALTER COLUMN org_code SET NOT NULL;
ALTER TABLE organizations ADD CONSTRAINT uq_organizations_org_code UNIQUE (org_code);
CREATE INDEX idx_organizations_org_code ON organizations(org_code);

-- ── Users: user_number ────────────────────────────────────────────────────────
ALTER TABLE app_user ADD COLUMN user_number VARCHAR(6);

WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY id) AS rn
    FROM app_user
)
UPDATE app_user u
SET user_number = LPAD((100000 + r.rn - 1)::text, 6, '0')
FROM ranked r
WHERE u.id = r.id;

ALTER TABLE app_user ALTER COLUMN user_number SET NOT NULL;
ALTER TABLE app_user ADD CONSTRAINT uq_user_org_number UNIQUE (organization_id, user_number);

-- ── Staff: user_number ────────────────────────────────────────────────────────
ALTER TABLE staff_members ADD COLUMN user_number VARCHAR(6);

WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY id) AS rn
    FROM staff_members
)
UPDATE staff_members s
SET user_number = LPAD((500000 + r.rn - 1)::text, 6, '0')
FROM ranked r
WHERE s.id = r.id;

-- Sync employee_number to match new user_number for existing rows
UPDATE staff_members SET employee_number = 'EMP-' || user_number;

ALTER TABLE staff_members ALTER COLUMN user_number SET NOT NULL;
ALTER TABLE staff_members ADD CONSTRAINT uq_staff_org_number UNIQUE (organization_id, user_number);

-- ── Residents: resident_number ────────────────────────────────────────────────
ALTER TABLE residents ADD COLUMN resident_number VARCHAR(6);

WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM residents
)
UPDATE residents r
SET resident_number = LPAD((200000 + ranked.rn - 1)::text, 6, '0')
FROM ranked
WHERE r.id = ranked.id;

ALTER TABLE residents ALTER COLUMN resident_number SET NOT NULL;
ALTER TABLE residents ADD CONSTRAINT uq_residents_number UNIQUE (resident_number);
CREATE INDEX idx_residents_number ON residents(resident_number);
