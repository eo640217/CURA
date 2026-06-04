package com.cura.organization;

import com.cura.organization.dto.*;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService orgService;

    public OrganizationController(OrganizationService orgService) {
        this.orgService = orgService;
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping
    public List<OrganizationResponse> list() {
        return orgService.list();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/{id}")
    public OrganizationResponse get(@PathVariable Long id) {
        return orgService.get(id);
    }

    @GetMapping("/by-code/{orgCode}")
    public OrgBrandingResponse getByOrgCode(@PathVariable String orgCode) {
        return orgService.getByOrgCode(orgCode);
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<Resource> getLogo(@PathVariable Long id) {
        return orgService.getLogo(id);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse create(@Valid @RequestBody OrganizationCreateRequest req) {
        return orgService.create(req);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}")
    public OrganizationResponse update(@PathVariable Long id, @Valid @RequestBody OrganizationUpdateRequest req) {
        return orgService.update(id, req);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OrganizationResponse uploadLogo(@PathVariable Long id,
                                           @RequestParam("file") MultipartFile file) {
        return orgService.uploadLogo(id, file);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/root-user")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateRootUserResponse createRootUser(@PathVariable Long id,
                                                  @Valid @RequestBody CreateRootUserRequest req) {
        return orgService.createRootUser(id, req);
    }
}
