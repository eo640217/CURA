package com.cura.unit;

import com.cura.unit.dto.UnitCreateRequest;
import com.cura.unit.dto.UnitPatchRequest;
import com.cura.unit.dto.UnitResponse;
import com.cura.unit.dto.UnitUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public UnitResponse create(
            @PathVariable Long facilityId,
            @Valid @RequestBody UnitCreateRequest request
    ) {
        return unitService.create(facilityId, request);
    }

    @GetMapping("/facilities/{facilityId}/units")
    public List<UnitResponse> listByFacility(@PathVariable Long facilityId) {
        return unitService.listByFacility(facilityId);
    }

    @GetMapping("/units/{unitId}")
    public UnitResponse get(@PathVariable Long unitId) {
        return unitService.get(unitId);
    }

    @PutMapping("/units/{unitId}")
    public UnitResponse update(
            @PathVariable Long unitId,
            @Valid @RequestBody UnitUpdateRequest request
    ) {
        return unitService.update(unitId, request);
    }

    @DeleteMapping("/units/{unitId}")
    public void delete(@PathVariable Long unitId) {
        unitService.delete(unitId);
    }

    @PatchMapping("/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public UnitResponse patch(@PathVariable Long unitId, @Valid @RequestBody UnitPatchRequest req) {
        return unitService.patch(unitId, req);
    }

}
