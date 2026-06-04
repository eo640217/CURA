package com.cura.unit;

import com.cura.unit.dto.UnitResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findAllByFacilityId(Long facilityId);
    boolean existsByIdAndFacilityOrganizationId(Long unitId, Long orgId);
    @Query("""
        select new com.cura.unit.dto.UnitResponse(
            u.id,
            u.facility.id,
            u.name,
            u.type,
            u.capacity,
            count(r.id)
        )
        from Unit u
        left join Resident r on r.unit.id = u.id
        where u.facility.id = :facilityId
        group by u.id, u.facility.id, u.name, u.type, u.capacity
        order by u.name
    """)
    List<UnitResponse> listByFacilityWithOccupancy(Long facilityId);
}
