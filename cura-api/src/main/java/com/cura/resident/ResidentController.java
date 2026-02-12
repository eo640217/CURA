package com.cura.resident;

import com.cura.resident.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/residents")
public class ResidentController {

    private final ResidentService service;

    public ResidentController(ResidentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResidentResponse create(
            @Valid @RequestBody ResidentCreateRequest req) {
        return service.create(req);
    }

    @GetMapping("/{id}")
    public ResidentResponse get(
            @PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public List<ResidentResponse> listByFacility(
            @RequestParam Long facilityId) {
        return service.listByFacility(facilityId);
    }

    @PutMapping("/{id}")
    public ResidentResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ResidentUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id) {
        service.delete(id);
    }
}
