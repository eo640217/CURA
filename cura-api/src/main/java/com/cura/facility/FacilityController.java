package com.cura.facility;

import com.cura.facility.dto.FacilityCreateRequest;
import com.cura.facility.dto.FacilityResponse;
import com.cura.facility.dto.FacilityUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/facilities")
public class FacilityController {

    private final FacilityService service;

    public FacilityController(FacilityService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FacilityResponse create(@RequestBody FacilityCreateRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public FacilityResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public List<FacilityResponse> list() {
        return service.list();
    }

    @PutMapping("/{id}")
    public FacilityResponse update(@PathVariable Long id, @RequestBody FacilityUpdateRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
