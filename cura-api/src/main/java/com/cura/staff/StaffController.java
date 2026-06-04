package com.cura.staff;

import com.cura.common.TenantUtil;
import com.cura.staff.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public Page<StaffResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            Pageable pageable,
            Authentication auth) {
        return staffService.list(q, status, department, pageable, TenantUtil.orgId(auth));
    }

    @GetMapping("/{id}")
    public StaffDetailResponse get(@PathVariable Long id, Authentication auth) {
        return staffService.get(id, TenantUtil.orgId(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StaffDetailResponse create(@Valid @RequestBody StaffCreateRequest req, Authentication auth) {
        return staffService.create(req, TenantUtil.principal(auth).getOrgId());
    }

    @PutMapping("/{id}")
    public StaffDetailResponse update(@PathVariable Long id, @Valid @RequestBody StaffUpdateRequest req, Authentication auth) {
        return staffService.update(id, req, TenantUtil.orgId(auth));
    }

    @PatchMapping("/{id}/status")
    public StaffDetailResponse patchStatus(@PathVariable Long id, @Valid @RequestBody StaffStatusPatchRequest req, Authentication auth) {
        return staffService.patchStatus(id, req, TenantUtil.orgId(auth));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        staffService.delete(id, TenantUtil.orgId(auth));
    }

    @PostMapping("/{staffId}/facilities/{facilityId}")
    public StaffDetailResponse assignFacility(@PathVariable Long staffId, @PathVariable Long facilityId, Authentication auth) {
        return staffService.assignFacility(staffId, facilityId, TenantUtil.orgId(auth));
    }

    @DeleteMapping("/{staffId}/facilities/{facilityId}")
    public StaffDetailResponse removeFacility(@PathVariable Long staffId, @PathVariable Long facilityId, Authentication auth) {
        return staffService.removeFacility(staffId, facilityId, TenantUtil.orgId(auth));
    }
}
