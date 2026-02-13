package com.cura.resident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResidentRepository extends JpaRepository<Resident, Long> {
    List<Resident> findByUnitId(Long unitId);
    long countByUnitId(Long unitId);
    long countByUnitIdAndIdNot(Long unitId, Long id);
    List<Resident> findByUnitFacilityId(Long facilityId);
}
