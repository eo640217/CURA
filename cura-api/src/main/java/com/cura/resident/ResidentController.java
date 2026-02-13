package com.cura.resident;

import com.cura.resident.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/residents")
public class ResidentController {

    private final ResidentService residentService;

    public ResidentController(ResidentService service) {
        this.residentService = service;
    }

//    @PostMapping
//    @ResponseStatus(HttpStatus.CREATED)
//    public ResidentResponse create(
//            @Valid @RequestBody ResidentCreateRequest req) {
//        return residentService.create(req);
//    }

    @GetMapping("/{id}")
    public ResidentResponse get(
            @PathVariable Long id) {
        return residentService.get(id);
    }

    @GetMapping
    public List<ResidentResponse> listByFacility(
            @RequestParam Long facilityId) {
        return residentService.listByFacility(facilityId);
    }

    @PutMapping("/{id}")
    public ResidentResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ResidentUpdateRequest req) {
        return residentService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id) {
        residentService.delete(id);
    }

    @PostMapping("/units/{unitId}/residents")
    public ResidentResponse createUnderUnit(
            @PathVariable Long unitId,
            @Valid @RequestBody ResidentCreateRequest request
    ) {
        return residentService.createUnderUnit(unitId, request);
    }

    @GetMapping("/units/{unitId}/residents")
    public List<ResidentResponse> listByUnit(@PathVariable Long unitId) {
        return residentService.listByUnit(unitId);
    }

    // ResidentController has @RequestMapping("/api/v1/residents")

    @PatchMapping("/{id}/transfer")
    public ResidentResponse transfer(
            @PathVariable Long id,
            @Valid @RequestBody ResidentTransferRequest req
    ) {
        return residentService.transfer(id, req);
    }


}
