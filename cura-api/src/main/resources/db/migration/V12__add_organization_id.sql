ALTER TABLE facilities ADD COLUMN organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE app_user   ADD COLUMN organization_id BIGINT REFERENCES organizations(id);

UPDATE facilities SET organization_id = (SELECT id FROM organizations ORDER BY id LIMIT 1);
UPDATE app_user   SET organization_id = (SELECT id FROM organizations ORDER BY id LIMIT 1);

ALTER TABLE facilities ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE app_user   ALTER COLUMN organization_id SET NOT NULL;
