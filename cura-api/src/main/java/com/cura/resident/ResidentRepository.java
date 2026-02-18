package com.cura.resident;
import com.cura.resident.dto.ResidentDetailResponse;
import com.cura.resident.dto.ResidentDirectoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResidentRepository extends JpaRepository<Resident, Long> {
    List<Resident> findByUnitId(Long unitId);
    long countByUnitId(Long unitId);
    long countByUnitIdAndIdNot(Long unitId, Long id);
    List<Resident> findByUnitFacilityId(Long facilityId);

    @Query("""
  select new com.cura.resident.dto.ResidentDirectoryItem(
        r.id,
        r.firstName,
        r.lastName,
        r.dateOfBirth,
        r.roomNumber,
        u.id,
        u.name,
        u.type,
        u.capacity,
        f.id,
        f.name
      )
      from Resident r
      join r.unit u
      join u.facility f
      where (:q is null or :q = ''
        or lower(r.firstName) like lower(concat('%', :q, '%'))
        or lower(r.lastName) like lower(concat('%', :q, '%'))
        or lower(r.roomNumber) like lower(concat('%', :q, '%'))
      )
      order by r.lastName asc, r.firstName asc
""")
    Page<ResidentDirectoryItem> searchDirectory(@Param("q") String q, Pageable pageable);

    @Query("""
          select new com.cura.resident.dto.ResidentDetailResponse(
            r.id,
            r.firstName,
            r.lastName,
            r.dateOfBirth,
            r.roomNumber,
            u.id,
            u.name,
            u.type,
            u.capacity,
            f.id,
            f.name,
            f.address
          )
          from Resident r
          join r.unit u
          join u.facility f
          where r.id = :id
        """)
    Optional<ResidentDetailResponse> findResidentDetail(@Param("id") Long id);

}
