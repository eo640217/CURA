package com.cura.facility;

import com.cura.common.TenantUtil;
import com.cura.facility.dto.FacilityCreateRequest;
import com.cura.facility.dto.FacilityResponse;
import com.cura.facility.dto.FacilityUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
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
    public FacilityResponse create(@Valid @RequestBody FacilityCreateRequest request, Authentication auth) {
        return service.create(request, TenantUtil.principal(auth).getOrgId());
    }

    @GetMapping("/{id}")
    public FacilityResponse get(@PathVariable Long id, Authentication auth) {
        return service.get(id, TenantUtil.orgId(auth));
    }

    @GetMapping
    public List<FacilityResponse> list(Authentication auth) {
        return service.list(TenantUtil.orgId(auth));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, TenantUtil.orgId(auth));
    }

    @PatchMapping("/{id}")
    public FacilityResponse update(@PathVariable Long id, @Valid @RequestBody FacilityUpdateRequest req, Authentication auth) {
        return service.update(id, req, TenantUtil.orgId(auth));
    }
}
