CREATE TABLE units (
    id BIGSERIAL PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    CONSTRAINT fk_units_facility
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);
CREATE INDEX idx_units_facility_id ON units(facility_id);
