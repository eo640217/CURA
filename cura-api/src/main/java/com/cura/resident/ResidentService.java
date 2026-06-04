package com.cura.resident;

import com.cura.common.NotFoundException;
import com.cura.common.UserNumberGenerator;
import com.cura.facility.FacilityRepository;
import com.cura.resident.dto.*;
import com.cura.unit.Unit;
import com.cura.unit.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;

import java.util.List;

@Service
public class ResidentService {

    private final ResidentRepository residentRepo;
    private final FacilityRepository facilityRepo;
    private final UnitRepository unitRepo;
    private final ResidentNoteRepository residentNoteRepository;
    private final UserNumberGenerator numberGenerator;

    public ResidentService(ResidentRepository residentRepo, FacilityRepository facilityRepo,
                           UnitRepository unitRepo, ResidentNoteRepository residentNoteRepository,
                           UserNumberGenerator numberGenerator) {
        this.residentRepo = residentRepo;
        this.facilityRepo = facilityRepo;
        this.unitRepo = unitRepo;
        this.residentNoteRepository = residentNoteRepository;
        this.numberGenerator = numberGenerator;
    }

    @Transactional(readOnly = true)
    public List<ResidentResponse> listByFacility(Long facilityId, Long orgId) {
        verifyFacilityOwnership(facilityId, orgId);
        return residentRepo.findByUnitFacilityId(facilityId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResidentResponse get(Long id, Long orgId) {
        verifyResidentOwnership(id, orgId);
        Resident r = residentRepo.findById(id).orElseThrow(() -> new NotFoundException("Resident not found: " + id));
        return toResponse(r);
    }

    @Transactional
    public ResidentResponse update(Long id, ResidentUpdateRequest req, Long orgId) {
        verifyResidentOwnership(id, orgId);
        Resident r = residentRepo.findById(id).orElseThrow(() -> new NotFoundException("Resident not found: " + id));
        if (req.firstName()  != null) r.setFirstName(req.firstName());
        if (req.lastName()   != null) r.setLastName(req.lastName());
        if (req.dateOfBirth() != null) r.setDateOfBirth(req.dateOfBirth());
        if (req.roomNumber() != null) r.setRoomNumber(req.roomNumber());
        return toResponse(residentRepo.save(r));
    }

    @Transactional
    public void delete(Long id, Long orgId) {
        verifyResidentOwnership(id, orgId);
        if (!residentRepo.existsById(id)) throw new NotFoundException("Resident not found: " + id);
        residentRepo.deleteById(id);
    }

    public ResidentResponse createUnderUnit(Long unitId, ResidentCreateRequest req, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        Unit unit = unitRepo.findById(unitId).orElseThrow(() -> new NotFoundException("Unit not found: " + unitId));

        long current = residentRepo.countByUnitId(unitId);
        if (current >= unit.getCapacity()) {
            throw new IllegalStateException("Unit is full (capacity " + unit.getCapacity() + ")");
        }

        String residentNumber = numberGenerator.generate(residentRepo::existsByResidentNumber);
        Resident resident = new Resident();
        resident.setFirstName(req.firstName());
        resident.setLastName(req.lastName());
        resident.setDateOfBirth(req.dateOfBirth());
        resident.setRoomNumber(req.roomNumber());
        resident.setUnit(unit);
        resident.setResidentNumber(residentNumber);
        return toResponse(residentRepo.save(resident));
    }

    @Transactional(readOnly = true)
    public List<ResidentResponse> listByUnit(Long unitId, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        return residentRepo.findByUnitId(unitId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ResidentResponse transfer(Long residentId, ResidentTransferRequest req, Long orgId) {
        verifyResidentOwnership(residentId, orgId);
        verifyUnitOwnership(req.toUnitId(), orgId);

        Resident resident = residentRepo.findById(residentId)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + residentId));
        Unit toUnit = unitRepo.findById(req.toUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found: " + req.toUnitId()));

        long current = residentRepo.countByUnitIdAndIdNot(toUnit.getId(), resident.getId());
        if (current >= toUnit.getCapacity()) {
            throw new IllegalStateException("Unit is full (capacity " + toUnit.getCapacity() + ")");
        }

        resident.setUnit(toUnit);
        if (req.roomNumber() != null) resident.setRoomNumber(req.roomNumber());
        return toResponse(residentRepo.save(resident));
    }

    @Transactional(readOnly = true)
    public Page<ResidentDirectoryItem> directory(String q, Pageable pageable, Long orgId) {
        if (q == null || q.trim().isEmpty()) {
            return residentRepo.findAllDirectory(orgId, pageable);
        }
        return residentRepo.searchDirectory(q.trim(), orgId, pageable);
    }

    @Transactional(readOnly = true)
    public ResidentDetailResponse getResidentDetail(Long id, Long orgId) {
        verifyResidentOwnership(id, orgId);
        return residentRepo.findResidentDetail(id)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<ResidentNoteResponse> listNotes(Long residentId, Long orgId) {
        verifyResidentOwnership(residentId, orgId);
        return residentNoteRepository.findByResidentIdOrderByCreatedAtDesc(residentId).stream()
                .map(n -> new ResidentNoteResponse(n.getId(), n.getResidentId(), n.getBody(), n.getCreatedAt(), n.getCreatedBy()))
                .toList();
    }

    @Transactional
    public ResidentNoteResponse addNote(Long residentId, ResidentNoteCreateRequest req, String createdBy, Long orgId) {
        verifyResidentOwnership(residentId, orgId);
        ResidentNote n = new ResidentNote();
        n.setResidentId(residentId);
        n.setBody(req.body());
        n.setCreatedBy(createdBy);
        ResidentNote saved = residentNoteRepository.save(n);
        return new ResidentNoteResponse(saved.getId(), saved.getResidentId(), saved.getBody(), saved.getCreatedAt(), saved.getCreatedBy());
    }

    // ── ownership guards ──────────────────────────────────────────────────────

    private void verifyFacilityOwnership(Long facilityId, Long orgId) {
        if (orgId == null) return;
        if (!facilityRepo.existsByIdAndOrganizationId(facilityId, orgId)) {
            throw new NotFoundException("Facility not found: " + facilityId);
        }
    }

    private void verifyUnitOwnership(Long unitId, Long orgId) {
        if (orgId == null) return;
        if (!unitRepo.existsByIdAndFacilityOrganizationId(unitId, orgId)) {
            throw new NotFoundException("Unit not found: " + unitId);
        }
    }

    private void verifyResidentOwnership(Long residentId, Long orgId) {
        if (orgId == null) return;
        if (!residentRepo.existsByIdAndUnitFacilityOrganizationId(residentId, orgId)) {
            throw new NotFoundException("Resident not found: " + residentId);
        }
    }

    private ResidentResponse toResponse(Resident r) {
        Long unitId = r.getUnit() != null ? r.getUnit().getId() : null;
        Long facilityId = r.getUnit() != null ? r.getUnit().getFacility().getId() : null;
        return new ResidentResponse(r.getId(), facilityId, unitId, r.getFirstName(), r.getLastName(), r.getDateOfBirth(), r.getRoomNumber(), r.getCreatedAt());
    }
}
