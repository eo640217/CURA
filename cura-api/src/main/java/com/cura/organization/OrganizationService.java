package com.cura.organization;

import com.cura.common.NotFoundException;
import com.cura.organization.dto.*;
import com.cura.user.User;
import com.cura.user.UserRole;
import com.cura.user.UserService;
import com.cura.user.dto.UserResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository orgRepo;
    private final UserService userService;

    public OrganizationService(OrganizationRepository orgRepo, UserService userService) {
        this.orgRepo = orgRepo;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> list() {
        return orgRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public OrganizationResponse create(OrganizationCreateRequest req) {
        if (orgRepo.existsByOrgCode(req.orgCode())) {
            throw new com.cura.common.ConflictException("Org code already in use: " + req.orgCode());
        }
        Organization org = new Organization(req.name());
        org.setOrgCode(req.orgCode().toUpperCase());
        org.setContactEmail(req.contactEmail());
        org.setPhone(req.phone());
        return toResponse(orgRepo.save(org));
    }

    @Transactional
    public OrganizationResponse update(Long id, OrganizationUpdateRequest req) {
        Organization org = findOrThrow(id);
        org.setName(req.name());
        org.setContactEmail(req.contactEmail());
        org.setPhone(req.phone());
        return toResponse(orgRepo.save(org));
    }

    @Transactional
    public UserResponse createRootUser(Long orgId, CreateRootUserRequest req) {
        Organization org = findOrThrow(orgId);
        User created = userService.createUser(req.username(), req.password(), UserRole.ADMIN, org);
        return new UserResponse(created.getId(), created.getUsername(), created.getRole());
    }

    private Organization findOrThrow(Long id) {
        return orgRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Organization not found: " + id));
    }

    private OrganizationResponse toResponse(Organization o) {
        return new OrganizationResponse(o.getId(), o.getName(), o.getOrgCode(), o.getContactEmail(), o.getPhone(), o.getCreatedAt(), o.getUpdatedAt());
    }
}
