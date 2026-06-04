package com.cura.resident;

import com.cura.common.TenantUtil;
import com.cura.resident.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/residents")
public class ResidentController {

    private final ResidentService residentService;

    public ResidentController(ResidentService service) {
        this.residentService = service;
    }

    @GetMapping("/{id}")
    public ResidentDetailResponse get(@PathVariable Long id, Authentication auth) {
        return residentService.getResidentDetail(id, TenantUtil.orgId(auth));
    }

    @GetMapping
    public List<ResidentResponse> listByFacility(@RequestParam Long facilityId, Authentication auth) {
        return residentService.listByFacility(facilityId, TenantUtil.orgId(auth));
    }

    @PutMapping("/{id}")
    public ResidentResponse update(@PathVariable Long id, @Valid @RequestBody ResidentUpdateRequest req, Authentication auth) {
        return residentService.update(id, req, TenantUtil.orgId(auth));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        residentService.delete(id, TenantUtil.orgId(auth));
    }

    @PostMapping("/units/{unitId}/residents")
    public ResidentResponse createUnderUnit(@PathVariable Long unitId, @Valid @RequestBody ResidentCreateRequest request, Authentication auth) {
        return residentService.createUnderUnit(unitId, request, TenantUtil.orgId(auth));
    }

    @GetMapping("/units/{unitId}/residents")
    public List<ResidentResponse> listByUnit(@PathVariable Long unitId, Authentication auth) {
        return residentService.listByUnit(unitId, TenantUtil.orgId(auth));
    }

    @PatchMapping("/{id}/transfer")
    public ResidentResponse transfer(@PathVariable Long id, @Valid @RequestBody ResidentTransferRequest req, Authentication auth) {
        return residentService.transfer(id, req, TenantUtil.orgId(auth));
    }

    @GetMapping("/directory")
    public Page<ResidentDirectoryItem> directory(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 25, sort = "lastName") Pageable pageable,
            Authentication auth) {
        return residentService.directory(q, pageable, TenantUtil.orgId(auth));
    }

    @GetMapping("/{id}/details")
    public ResidentDetailResponse details(@PathVariable Long id, Authentication auth) {
        return residentService.getResidentDetail(id, TenantUtil.orgId(auth));
    }

    @GetMapping("/{id}/notes")
    public List<ResidentNoteResponse> listNotes(@PathVariable Long id, Authentication auth) {
        return residentService.listNotes(id, TenantUtil.orgId(auth));
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public ResidentNoteResponse addNote(@PathVariable Long id, @Valid @RequestBody ResidentNoteCreateRequest req, Authentication auth) {
        String username = TenantUtil.principal(auth).getUsername();
        return residentService.addNote(id, req, username, TenantUtil.orgId(auth));
    }
}
