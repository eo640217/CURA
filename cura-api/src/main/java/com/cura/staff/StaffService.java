package com.cura.staff;

import com.cura.common.NotFoundException;
import com.cura.common.UserNumberGenerator;
import com.cura.common.error.ApiException;
import com.cura.common.error.ErrorCode;
import com.cura.facility.Facility;
import com.cura.facility.FacilityRepository;
import com.cura.organization.Organization;
import com.cura.organization.OrganizationRepository;
import com.cura.staff.dto.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class StaffService {

    private final StaffMemberRepository staffRepo;
    private final FacilityRepository facilityRepo;
    private final OrganizationRepository orgRepo;
    private final UserNumberGenerator numberGenerator;

    public StaffService(StaffMemberRepository staffRepo, FacilityRepository facilityRepo,
                        OrganizationRepository orgRepo, UserNumberGenerator numberGenerator) {
        this.staffRepo = staffRepo;
        this.facilityRepo = facilityRepo;
        this.orgRepo = orgRepo;
        this.numberGenerator = numberGenerator;
    }

    @Transactional(readOnly = true)
    public Page<StaffResponse> list(String q, String status, String department, Pageable pageable, Long orgId) {
        Specification<StaffMember> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (orgId != null) {
                predicates.add(cb.equal(root.get("organization").get("id"), orgId));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")),  pattern),
                        cb.like(cb.lower(root.get("email")),     pattern)
                ));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), StaffStatus.valueOf(status)));
            }
            if (department != null && !department.isBlank()) {
                predicates.add(cb.equal(root.get("department"), StaffDepartment.valueOf(department)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return staffRepo.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public StaffDetailResponse get(Long id, Long orgId) {
        StaffMember s = findOrThrow(id);
        verifyOwnership(s, orgId);
        return toDetail(s);
    }

    @Transactional
    public StaffDetailResponse create(StaffCreateRequest req, Long orgId) {
        if (staffRepo.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Email already in use");
        }
        if (req.employeeNumber() != null && !req.employeeNumber().isBlank() && staffRepo.existsByEmployeeNumber(req.employeeNumber())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Employee number already in use");
        }
        if (req.username() != null && !req.username().isBlank() && staffRepo.existsByUsername(req.username())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Username already in use");
        }
        Organization org = orgRepo.findById(orgId)
                .orElseThrow(() -> new NotFoundException("Organization not found: " + orgId));
        String userNumber = numberGenerator.generate(
                n -> staffRepo.existsByOrganizationIdAndUserNumber(orgId, n));
        StaffMember s = new StaffMember();
        applyFields(s, req);
        s.setOrganization(org);
        s.setUserNumber(userNumber);
        s.setEmployeeNumber("EMP-" + userNumber);
        s.setStatus(StaffStatus.ACTIVE);
        return toDetail(staffRepo.save(s));
    }

    @Transactional
    public StaffDetailResponse update(Long id, StaffUpdateRequest req, Long orgId) {
        StaffMember s = findOrThrow(id);
        verifyOwnership(s, orgId);
        if (!s.getEmail().equalsIgnoreCase(req.email()) && staffRepo.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Email already in use");
        }
        if (req.employeeNumber() != null && !req.employeeNumber().isBlank()
                && !req.employeeNumber().equals(s.getEmployeeNumber())
                && staffRepo.existsByEmployeeNumber(req.employeeNumber())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Employee number already in use");
        }
        if (req.username() != null && !req.username().isBlank()
                && !req.username().equals(s.getUsername())
                && staffRepo.existsByUsername(req.username())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Username already in use");
        }
        applyFields(s, req);
        return toDetail(staffRepo.save(s));
    }

    @Transactional
    public StaffDetailResponse patchStatus(Long id, StaffStatusPatchRequest req, Long orgId) {
        StaffMember s = findOrThrow(id);
        verifyOwnership(s, orgId);
        s.setStatus(StaffStatus.valueOf(req.status()));
        return toDetail(staffRepo.save(s));
    }

    @Transactional
    public void delete(Long id, Long orgId) {
        StaffMember s = findOrThrow(id);
        verifyOwnership(s, orgId);
        s.setStatus(StaffStatus.TERMINATED);
        staffRepo.save(s);
    }

    @Transactional
    public StaffDetailResponse assignFacility(Long staffId, Long facilityId, Long orgId) {
        StaffMember s = findOrThrow(staffId);
        verifyOwnership(s, orgId);
        if (orgId != null && !facilityRepo.existsByIdAndOrganizationId(facilityId, orgId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Facility not found");
        }
        Facility f = facilityRepo.findById(facilityId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Facility not found"));
        s.getFacilities().add(f);
        return toDetail(staffRepo.save(s));
    }

    @Transactional
    public StaffDetailResponse removeFacility(Long staffId, Long facilityId, Long orgId) {
        StaffMember s = findOrThrow(staffId);
        verifyOwnership(s, orgId);
        s.getFacilities().removeIf(f -> f.getId().equals(facilityId));
        return toDetail(staffRepo.save(s));
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> listByFacility(Long facilityId, Long orgId) {
        if (orgId != null && !facilityRepo.existsByIdAndOrganizationId(facilityId, orgId)) {
            throw new NotFoundException("Facility not found: " + facilityId);
        }
        return staffRepo.findByFacilityId(facilityId).stream().map(this::toResponse).toList();
    }

    private void verifyOwnership(StaffMember s, Long orgId) {
        if (orgId == null) return;
        if (!s.getOrganization().getId().equals(orgId)) {
            throw new NotFoundException("Staff member not found: " + s.getId());
        }
    }

    private StaffMember findOrThrow(Long id) {
        return staffRepo.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Staff member not found"));
    }

    private void applyFields(StaffMember s, StaffCreateRequest req) {
        s.setFirstName(req.firstName());
        s.setLastName(req.lastName());
        s.setEmail(req.email());
        s.setPhone(req.phone());
        s.setEmployeeNumber(req.employeeNumber() != null && !req.employeeNumber().isBlank() ? req.employeeNumber() : null);
        s.setUsername(req.username() != null && !req.username().isBlank() ? req.username() : null);
        s.setJobTitle(req.jobTitle());
        s.setDepartment(StaffDepartment.valueOf(req.department()));
        s.setEmploymentType(StaffEmploymentType.valueOf(req.employmentType()));
        s.setHireDate(req.hireDate());
        s.setDateOfBirth(req.dateOfBirth());
        s.setNotes(req.notes());
    }

    private void applyFields(StaffMember s, StaffUpdateRequest req) {
        s.setFirstName(req.firstName());
        s.setLastName(req.lastName());
        s.setEmail(req.email());
        s.setPhone(req.phone());
        s.setEmployeeNumber(req.employeeNumber() != null && !req.employeeNumber().isBlank() ? req.employeeNumber() : null);
        s.setUsername(req.username() != null && !req.username().isBlank() ? req.username() : null);
        s.setJobTitle(req.jobTitle());
        s.setDepartment(StaffDepartment.valueOf(req.department()));
        s.setEmploymentType(StaffEmploymentType.valueOf(req.employmentType()));
        s.setHireDate(req.hireDate());
        s.setDateOfBirth(req.dateOfBirth());
        s.setNotes(req.notes());
    }

    private StaffResponse toResponse(StaffMember s) {
        return new StaffResponse(
                s.getId(), s.getFirstName(), s.getLastName(), s.getEmail(), s.getPhone(),
                s.getEmployeeNumber(), s.getUsername(),
                s.getJobTitle(), s.getDepartment().name(), s.getEmploymentType().name(),
                s.getStatus().name(),
                s.getHireDate() != null ? s.getHireDate().toString() : null,
                s.getCreatedAt()
        );
    }

    private StaffDetailResponse toDetail(StaffMember s) {
        List<StaffDetailResponse.FacilitySummary> facilities = s.getFacilities().stream()
                .map(f -> new StaffDetailResponse.FacilitySummary(f.getId(), f.getName()))
                .toList();
        return new StaffDetailResponse(
                s.getId(), s.getFirstName(), s.getLastName(), s.getEmail(), s.getPhone(),
                s.getEmployeeNumber(), s.getUsername(),
                s.getJobTitle(), s.getDepartment().name(), s.getEmploymentType().name(),
                s.getStatus().name(),
                s.getHireDate() != null ? s.getHireDate().toString() : null,
                s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : null,
                s.getNotes(), s.getUserId(), facilities, s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
