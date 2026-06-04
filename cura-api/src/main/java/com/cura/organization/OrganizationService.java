package com.cura.organization;

import com.cura.auth.SetupTokenService;
import com.cura.common.ConflictException;
import com.cura.common.NotFoundException;
import com.cura.organization.dto.*;
import com.cura.user.User;
import com.cura.user.UserRole;
import com.cura.user.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

@Service
public class OrganizationService {

    private final OrganizationRepository orgRepo;
    private final UserService userService;
    private final SetupTokenService setupTokenService;
    private final String uploadDir;

    public OrganizationService(OrganizationRepository orgRepo, UserService userService,
                               SetupTokenService setupTokenService,
                               @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.orgRepo = orgRepo;
        this.userService = userService;
        this.setupTokenService = setupTokenService;
        this.uploadDir = uploadDir;
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> list() {
        return orgRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public OrgBrandingResponse getByOrgCode(String orgCode) {
        Organization org = orgRepo.findByOrgCode(orgCode.toUpperCase())
                .orElseThrow(() -> new NotFoundException("Organization not found: " + orgCode));
        return new OrgBrandingResponse(org.getId(), org.getName(), org.getOrgCode(),
                org.getLogoUrl(), org.getPrimaryColor());
    }

    @Transactional
    public OrganizationResponse create(OrganizationCreateRequest req) {
        if (orgRepo.existsByOrgCode(req.orgCode())) {
            throw new ConflictException("Org code already in use: " + req.orgCode());
        }
        Organization org = new Organization(req.name());
        org.setOrgCode(req.orgCode().toUpperCase());
        if (req.planTier() != null) org.setPlanTier(req.planTier());
        org.setContactEmail(req.contactEmail());
        org.setPhone(req.phone());
        return toResponse(orgRepo.save(org));
    }

    @Transactional
    public OrganizationResponse update(Long id, OrganizationUpdateRequest req) {
        Organization org = findOrThrow(id);
        org.setName(req.name());
        if (req.planTier() != null) org.setPlanTier(req.planTier());
        if (req.primaryColor() != null) org.setPrimaryColor(req.primaryColor());
        org.setContactEmail(req.contactEmail());
        org.setPhone(req.phone());
        return toResponse(orgRepo.save(org));
    }

    @Transactional
    public CreateRootUserResponse createRootUser(Long orgId, CreateRootUserRequest req) {
        Organization org = findOrThrow(orgId);
        if (userService.hasAdminForOrg(orgId)) {
            throw new ConflictException("Root admin already exists for this organization");
        }
        User user = userService.createPendingUser(req.username(), UserRole.ADMIN, org);
        String rawToken = setupTokenService.generate(user.getId());
        String setupLink = "/setup-password?token=" + rawToken;
        return new CreateRootUserResponse(user.getId(), user.getUsername(), user.getUserNumber(), setupLink);
    }

    @Transactional
    public OrganizationResponse uploadLogo(Long id, MultipartFile file) {
        Organization org = findOrThrow(id);
        String original = file.getOriginalFilename();
        String ext = (original != null && original.lastIndexOf('.') >= 0)
                ? original.substring(original.lastIndexOf('.'))
                : ".bin";
        Path dest = Path.of(uploadDir, "logos", "org_" + id + ext);
        try {
            Files.createDirectories(dest.getParent());
            file.transferTo(dest.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to store logo", e);
        }
        org.setLogoUrl("/api/v1/organizations/" + id + "/logo");
        return toResponse(orgRepo.save(org));
    }

    public ResponseEntity<Resource> getLogo(Long id) {
        findOrThrow(id);
        Path dir = Path.of(uploadDir, "logos");
        if (!Files.exists(dir)) return ResponseEntity.notFound().build();
        try (Stream<Path> files = Files.list(dir)) {
            Path found = files
                    .filter(p -> p.getFileName().toString().startsWith("org_" + id + "."))
                    .findFirst()
                    .orElse(null);
            if (found == null) return ResponseEntity.notFound().build();
            String contentType = Files.probeContentType(found);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            contentType != null ? contentType : "application/octet-stream"))
                    .body(new PathResource(found));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private Organization findOrThrow(Long id) {
        return orgRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Organization not found: " + id));
    }

    private OrganizationResponse toResponse(Organization o) {
        return new OrganizationResponse(o.getId(), o.getName(), o.getOrgCode(), o.getPlanTier(),
                o.getLogoUrl(), o.getPrimaryColor(), o.getContactEmail(), o.getPhone(),
                o.getCreatedAt(), o.getUpdatedAt());
    }
}
