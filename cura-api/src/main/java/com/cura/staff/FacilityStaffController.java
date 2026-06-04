package com.cura.staff;

import com.cura.common.TenantUtil;
import com.cura.staff.dto.StaffResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/facilities/{facilityId}/staff")
public class FacilityStaffController {

    private final StaffService staffService;

    public FacilityStaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public List<StaffResponse> listByFacility(@PathVariable Long facilityId, Authentication auth) {
        return staffService.listByFacility(facilityId, TenantUtil.orgId(auth));
    }
}
