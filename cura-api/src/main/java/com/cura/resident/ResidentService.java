package com.cura.resident;

import com.cura.common.NotFoundException;
import com.cura.facility.FacilityRepository;
import com.cura.resident.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResidentService {

    private final ResidentRepository repo;
    private final FacilityRepository facilityRepo;

    public ResidentService(ResidentRepository repo, FacilityRepository facilityRepo) {
        this.repo = repo;
        this.facilityRepo = facilityRepo;
    }

    @Transactional
    public ResidentResponse create(ResidentCreateRequest req) {
        // ✅ Prevent FK crash: validate facility exists
        if (!facilityRepo.existsById(req.facilityId())) {
            throw new NotFoundException("Facility not found: " + req.facilityId());
        }

        Resident r = new Resident();
        r.setFacilityId(req.facilityId());
        r.setFirstName(req.firstName());
        r.setLastName(req.lastName());
        r.setDateOfBirth(req.dateOfBirth());
        r.setRoomNumber(req.roomNumber());
        // if Resident has notes in code, set it too:
        // r.setNotes(req.notes());

        Resident saved = repo.save(r);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ResidentResponse> listByFacility(Long facilityId) {
        // optional: validate facility exists so you can 404 instead of returning []
        if (!facilityRepo.existsById(facilityId)) {
            throw new NotFoundException("Facility not found: " + facilityId);
        }
        return repo.findByFacilityId(facilityId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResidentResponse get(Long id) {
        Resident r = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + id));
        return toResponse(r);
    }

    @Transactional
    public ResidentResponse update(Long id, ResidentUpdateRequest req) {
        Resident r = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Resident not found: " + id));

        if (req.firstName() != null) r.setFirstName(req.firstName());
        if (req.lastName() != null) r.setLastName(req.lastName());
        if (req.dateOfBirth() != null) r.setDateOfBirth(req.dateOfBirth());
        if (req.roomNumber() != null) r.setRoomNumber(req.roomNumber());
        // if notes exists on entity:
        // if (req.notes() != null) r.setNotes(req.notes());

        return toResponse(repo.save(r));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new NotFoundException("Resident not found: " + id);
        repo.deleteById(id);
    }

    private ResidentResponse toResponse(Resident r) {
        return new ResidentResponse(
                r.getId(),
                r.getFacilityId(),
                r.getFirstName(),
                r.getLastName(),
                r.getDateOfBirth(),
                r.getRoomNumber(),
                r.getCreatedAt()
        );
    }
}
