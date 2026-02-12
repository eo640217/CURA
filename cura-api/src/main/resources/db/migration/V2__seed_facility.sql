-- Create a default facility so Resident POSTs don't fail with FK errors
INSERT INTO facilities (name, created_at)
SELECT 'Default Facility', now()
    WHERE NOT EXISTS (
  SELECT 1 FROM facilities WHERE name = 'Default Facility'
);
