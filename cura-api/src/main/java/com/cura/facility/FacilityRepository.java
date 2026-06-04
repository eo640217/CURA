package com.cura.facility;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByOrganizationId(Long orgId);
    boolean existsByIdAndOrganizationId(Long id, Long orgId);
}
