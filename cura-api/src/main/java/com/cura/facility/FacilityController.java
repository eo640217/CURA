package com.cura.facility;

import com.cura.facility.dto.FacilityCreateRequest;
import com.cura.facility.dto.FacilityResponse;
import com.cura.facility.dto.FacilityUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FacilityResponse create(@Valid @RequestBody FacilityCreateRequest request) {
        return facilityService.create(request);
    }

    @GetMapping("/{id}")
    public FacilityResponse get(@PathVariable Long id) {
        return facilityService.get(id);
    }

    @GetMapping
    public List<FacilityResponse> list() {
        return facilityService.list();
    }

    @PutMapping("/{id}")
    public FacilityResponse update(
            @PathVariable Long id,
            @Valid @RequestBody FacilityUpdateRequest req) {
        return facilityService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        facilityService.delete(id);
    }
}



