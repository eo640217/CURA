package com.cura.facility;

import com.cura.common.NotFoundException;
import com.cura.facility.dto.FacilityCreateRequest;
import com.cura.facility.dto.FacilityResponse;
import com.cura.facility.dto.FacilityUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public FacilityResponse create(FacilityCreateRequest request) {
        Facility facility = new Facility();
        facility.setName(request.name());
        facility.setAddress(request.address());

        Facility saved = facilityRepository.save(facility);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public FacilityResponse get(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Facility not found: " + id));
        return toResponse(facility);
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> list() {
        return facilityRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FacilityResponse toResponse(Facility f) {
        return new FacilityResponse(
                f.getId(),
                f.getName(),
                f.getAddress(),
                f.getCreatedAt()
        );
    }

    public FacilityResponse update(Long id, FacilityUpdateRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Facility not found: " + id));

        facility.setName(request.name());
        facility.setAddress(request.address());

        Facility saved = facilityRepository.save(facility);
        return toResponse(saved);
    }

    public void delete(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new NotFoundException("Facility not found: " + id);
        }
        facilityRepository.deleteById(id);
    }
}
