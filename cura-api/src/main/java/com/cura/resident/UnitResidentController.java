package com.cura.resident;

import com.cura.resident.dto.ResidentCreateRequest;
import com.cura.resident.dto.ResidentResponse;
import com.cura.resident.dto.ResidentTransferRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
public class UnitResidentController {

    private final ResidentService residentService;

    public UnitResidentController(ResidentService residentService) {
        this.residentService = residentService;
    }

    @PostMapping("/{unitId}/residents")
    public ResidentResponse createUnderUnit(
            @PathVariable Long unitId,
            @Valid @RequestBody ResidentCreateRequest request
    ) {
        return residentService.createUnderUnit(unitId, request);
    }

    @GetMapping("/{unitId}/residents")
    public List<ResidentResponse> listByUnit(@PathVariable Long unitId) {
        return residentService.listByUnit(unitId);
    }
    @PatchMapping("/residents/{id}/transfer")
    public ResidentResponse transfer(
            @PathVariable Long id,
            @Valid @RequestBody ResidentTransferRequest req
    ) {
        return residentService.transfer(id, req);
    }
//
}
