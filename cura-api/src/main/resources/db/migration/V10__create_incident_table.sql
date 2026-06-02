CREATE TABLE incidents (
   id BIGSERIAL PRIMARY KEY,
   title VARCHAR(120) NOT NULL,
   description VARCHAR(1000),
   incident_type VARCHAR(50) NOT NULL,
   severity VARCHAR(10) NOT NULL,
   status VARCHAR(20) NOT NULL,
   occurred_at TIMESTAMPTZ NOT NULL,
   reported_at TIMESTAMPTZ NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

   reported_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   resident_id BIGINT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
   facility_id BIGINT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

   CONSTRAINT chk_incidents_severity
       CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

   CONSTRAINT chk_incidents_status
       CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),

   CONSTRAINT chk_incidents_incident_type
       CHECK (incident_type IN ('FALL', 'MEDICATION', 'BEHAVIORAL', 'INJURY', 'OTHER'))
);