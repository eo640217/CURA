package com.cura.resident;

import com.cura.common.NotFoundException;
import com.cura.facility.FacilityRepository;
import com.cura.resident.dto.*;
import com.cura.unit.Unit;
import com.cura.unit.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cura.resident.dto.ResidentDirectoryItem;
import org.springframework.data.domain.*;

import java.util.List;

@Service
public class ResidentService {

    private final ResidentRepository residentRepo;
    private final FacilityRepository facilityRepo;
    private final UnitRepository unitRepo;
    private final ResidentNoteRepository residentNoteRepository;

    public ResidentService(ResidentRepository residentRepo, FacilityRepository facilityRepo, UnitRepository unitRepo, ResidentNoteRepository residentNoteRepository) {
        this.residentRepo = residentRepo;
        this.facilityRepo = facilityRepo;
        this.unitRepo = unitRepo;
        this.residentNoteRepository = residentNoteRepository;

    }

    @Transactional(readOnly = true)
    public List<ResidentResponse> listByFacility(Long facilityId) {
        if (!facilityRepo.existsById(facilityId)) {
            throw new NotFoundException("Facility not found: " + facilityId);
        }

        return residentRepo.findByUnitFacilityId(facilityId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResidentResponse get(Long id) {
        Resident r = residentRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + id));
        return toResponse(r);
    }

    @Transactional
    public ResidentResponse update(Long id, ResidentUpdateRequest req) {
        Resident r = residentRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + id));

        if (req.firstName() != null) r.setFirstName(req.firstName());
        if (req.lastName() != null) r.setLastName(req.lastName());
        if (req.dateOfBirth() != null) r.setDateOfBirth(req.dateOfBirth());
        if (req.roomNumber() != null) r.setRoomNumber(req.roomNumber());
        // if notes exists on entity:
        // if (req.notes() != null) r.setNotes(req.notes());

        return toResponse(residentRepo.save(r));
    }

    @Transactional
    public void delete(Long id) {
        if (!residentRepo.existsById(id)) throw new NotFoundException("Resident not found: " + id);
        residentRepo.deleteById(id);
    }

    private ResidentResponse toResponse(Resident resident) {
        Long unitId = resident.getUnit() != null ? resident.getUnit().getId() : null;
        Long facilityId = resident.getUnit() != null ? resident.getUnit().getFacility().getId() : null;

        return new ResidentResponse(
                resident.getId(),
                facilityId,
                unitId,
                resident.getFirstName(),
                resident.getLastName(),
                resident.getDateOfBirth(),
                resident.getRoomNumber(),
                resident.getCreatedAt()
        );
    }

    public ResidentResponse createUnderUnit(Long unitId, ResidentCreateRequest residentCreateRequest) {
        Unit unit = unitRepo.findById(unitId)
                .orElseThrow(() -> new NotFoundException("Unit not found with id " + unitId));

        long currentUnitCount = residentRepo.countByUnitId(unitId);
        if (currentUnitCount >= unit.getCapacity()) {
            throw new IllegalStateException("Unit is full (capacity " + unit.getCapacity() + ")");
        }

        Resident resident = new Resident();
        resident.setFirstName(residentCreateRequest.firstName());
        resident.setLastName(residentCreateRequest.lastName());
        resident.setDateOfBirth(residentCreateRequest.dateOfBirth());
        resident.setRoomNumber(residentCreateRequest.roomNumber());
        resident.setUnit(unit);

        Resident saved = residentRepo.save(resident);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ResidentResponse> listByUnit(Long unitId) {
        if (!unitRepo.existsById(unitId)) {
            throw new NotFoundException("Unit not found with id " + unitId);
        }

        return residentRepo.findByUnitId(unitId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    @Transactional
    public ResidentResponse transfer(Long residentId, ResidentTransferRequest req) {
        Resident resident = residentRepo.findById(residentId)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + residentId));

        Unit toUnit = unitRepo.findById(req.toUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found: " + req.toUnitId()));

        long current = residentRepo.countByUnitIdAndIdNot(toUnit.getId(), resident.getId());
        if (current >= toUnit.getCapacity()) {
            throw new IllegalStateException("Unit is full (capacity " + toUnit.getCapacity() + ")");
        }

        resident.setUnit(toUnit);

        if (req.roomNumber() != null) {
            resident.setRoomNumber(req.roomNumber());
        }

        return toResponse(residentRepo.save(resident));
    }
    @Transactional(readOnly = true)
    public Page<ResidentDirectoryItem> directory(String q, Pageable pageable) {
        if (q == null || q.trim().isEmpty()) {
            return residentRepo.findAllDirectory(pageable);
        }
        return residentRepo.searchDirectory(q.trim(), pageable);
    }

    @Transactional(readOnly = true)
    public ResidentDetailResponse getResidentDetail(Long id) {
        return residentRepo.findResidentDetail(id)
                .orElseThrow(() -> new NotFoundException("Resident not found with id " + id));
    }

    @Transactional(readOnly = true)
    public List<ResidentNoteResponse> listNotes(Long residentId) {
        // Ensure resident exists (optional but good)
        residentRepo.findById(residentId).orElseThrow(() -> new NotFoundException("Resident not found with id " + residentId));

        return residentNoteRepository.findByResidentIdOrderByCreatedAtDesc(residentId)
                .stream()
                .map(n -> new ResidentNoteResponse(
                        n.getId(),
                        n.getResidentId(),
                        n.getBody(),
                        n.getCreatedAt(),
                        n.getCreatedBy()
                ))
                .toList();
    }

    @Transactional
    public ResidentNoteResponse addNote(Long residentId, ResidentNoteCreateRequest req, String createdBy) {
        residentRepo.findById(residentId).orElseThrow(() -> new NotFoundException("Resident not found with id " + residentId));

        ResidentNote n = new ResidentNote();
        n.setResidentId(residentId);
        n.setBody(req.body());
        n.setCreatedBy(createdBy); // can be null for MVP

        ResidentNote saved = residentNoteRepository.save(n);

        return new ResidentNoteResponse(
                saved.getId(),
                saved.getResidentId(),
                saved.getBody(),
                saved.getCreatedAt(),
                saved.getCreatedBy()
        );
    }


}
