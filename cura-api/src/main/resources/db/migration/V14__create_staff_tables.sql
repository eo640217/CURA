CREATE TABLE staff_members (
    id              BIGSERIAL PRIMARY KEY,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    phone           VARCHAR(30),
    job_title       VARCHAR(100)  NOT NULL,
    department      VARCHAR(50)   NOT NULL,
    employment_type VARCHAR(30)   NOT NULL,
    status          VARCHAR(30)   NOT NULL DEFAULT 'ACTIVE',
    hire_date       DATE          NOT NULL,
    date_of_birth   DATE,
    notes           TEXT,
    user_id         BIGINT        REFERENCES app_user(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL
);

CREATE TABLE staff_facilities (
    staff_id    BIGINT NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    facility_id BIGINT NOT NULL REFERENCES facilities(id)   ON DELETE CASCADE,
    PRIMARY KEY (staff_id, facility_id)
);

CREATE INDEX idx_staff_status     ON staff_members(status);
CREATE INDEX idx_staff_department ON staff_members(department);
CREATE INDEX idx_staff_email      ON staff_members(email);
