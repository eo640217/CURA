ALTER TABLE staff_members
    ADD COLUMN employee_number VARCHAR(30)  UNIQUE,
    ADD COLUMN username        VARCHAR(100) UNIQUE;

CREATE INDEX idx_staff_employee_number ON staff_members(employee_number);
CREATE INDEX idx_staff_username        ON staff_members(username);
