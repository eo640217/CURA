ALTER TABLE staff_members
    ADD COLUMN organization_id BIGINT REFERENCES organizations(id) ON DELETE RESTRICT;

-- back-fill: assign all existing staff to the first (default) organization
UPDATE staff_members
SET organization_id = (SELECT id FROM organizations ORDER BY id LIMIT 1)
WHERE organization_id IS NULL;

ALTER TABLE staff_members
    ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX idx_staff_organization ON staff_members(organization_id);
