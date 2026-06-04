package com.cura.organization;

import com.cura.organization.dto.*;
import com.cura.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping("/{id}/root-user")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createRootUser(@PathVariable Long id, @Valid @RequestBody CreateRootUserRequest req) {
        return orgService.createRootUser(id, req);
    }
}
