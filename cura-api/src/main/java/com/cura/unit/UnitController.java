package com.cura.unit;

import com.cura.common.TenantUtil;
import com.cura.unit.dto.UnitCreateRequest;
import com.cura.unit.dto.UnitPatchRequest;
import com.cura.unit.dto.UnitResponse;
import com.cura.unit.dto.UnitUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @PostMapping("/facilities/{facilityId}/units")
    public UnitResponse create(@PathVariable Long facilityId, @Valid @RequestBody UnitCreateRequest request, Authentication auth) {
        return unitService.create(facilityId, request, TenantUtil.orgId(auth));
    }

    @GetMapping("/facilities/{facilityId}/units")
    public List<UnitResponse> listByFacility(@PathVariable Long facilityId, Authentication auth) {
        return unitService.listByFacility(facilityId, TenantUtil.orgId(auth));
    }

    @GetMapping("/units/{unitId}")
    public UnitResponse get(@PathVariable Long unitId, Authentication auth) {
        return unitService.get(unitId, TenantUtil.orgId(auth));
    }

    @PutMapping("/units/{unitId}")
    public UnitResponse update(@PathVariable Long unitId, @Valid @RequestBody UnitUpdateRequest request, Authentication auth) {
        return unitService.update(unitId, request, TenantUtil.orgId(auth));
    }

    @DeleteMapping("/units/{unitId}")
    public void delete(@PathVariable Long unitId, Authentication auth) {
        unitService.delete(unitId, TenantUtil.orgId(auth));
    }

    @PatchMapping("/{unitId}")
    public UnitResponse patch(@PathVariable Long unitId, @Valid @RequestBody UnitPatchRequest req, Authentication auth) {
        return unitService.patch(unitId, req, TenantUtil.orgId(auth));
    }
}
