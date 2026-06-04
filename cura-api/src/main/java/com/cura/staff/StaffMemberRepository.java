package com.cura.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StaffMemberRepository extends JpaRepository<StaffMember, Long>, JpaSpecificationExecutor<StaffMember> {

    @Query("select s from StaffMember s join s.facilities f where f.id = :facilityId")
    List<StaffMember> findByFacilityId(@Param("facilityId") Long facilityId);

    boolean existsByOrganizationIdAndUserNumber(Long orgId, String userNumber);
    boolean existsByEmail(String email);
    boolean existsByEmployeeNumber(String employeeNumber);
    boolean existsByUsername(String username);

    Optional<StaffMember> findByUserId(Long userId);
}
