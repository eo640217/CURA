package com.cura.unit;

import com.cura.common.NotFoundException;
import com.cura.facility.Facility;
import com.cura.facility.FacilityRepository;
import com.cura.unit.dto.UnitCreateRequest;
import com.cura.unit.dto.UnitPatchRequest;
import com.cura.unit.dto.UnitResponse;
import com.cura.unit.dto.UnitUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final FacilityRepository facilityRepository;

    public UnitService(UnitRepository unitRepository, FacilityRepository facilityRepository) {
        this.unitRepository = unitRepository;
        this.facilityRepository = facilityRepository;
    }

    public UnitResponse create(Long facilityId, UnitCreateRequest request, Long orgId) {
        verifyFacilityOwnership(facilityId, orgId);
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new NotFoundException("Facility not found: " + facilityId));
        Unit unit = new Unit(facility, request.getName(), request.getType(), request.getCapacity());
        return new UnitResponse(unitRepository.save(unit));
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> listByFacility(Long facilityId, Long orgId) {
        verifyFacilityOwnership(facilityId, orgId);
        return unitRepository.listByFacilityWithOccupancy(facilityId);
    }

    public UnitResponse get(Long unitId, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("Unit not found: " + unitId));
        return new UnitResponse(unit);
    }

    public UnitResponse update(Long unitId, UnitUpdateRequest request, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("Unit not found: " + unitId));
        unit.setName(request.getName());
        unit.setType(request.getType());
        unit.setCapacity(request.getCapacity());
        return new UnitResponse(unitRepository.save(unit));
    }

    @Transactional
    public UnitResponse patch(Long unitId, UnitPatchRequest req, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("Unit not found: " + unitId));
        if (req.getName()     != null) unit.setName(req.getName());
        if (req.getType()     != null) unit.setType(req.getType());
        if (req.getCapacity() != null) unit.setCapacity(req.getCapacity());
        return new UnitResponse(unitRepository.save(unit));
    }

    public void delete(Long unitId, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        if (!unitRepository.existsById(unitId)) throw new NotFoundException("Unit not found: " + unitId);
        unitRepository.deleteById(unitId);
    }

    private void verifyFacilityOwnership(Long facilityId, Long orgId) {
        if (orgId == null) return;
        if (!facilityRepository.existsByIdAndOrganizationId(facilityId, orgId)) {
            throw new NotFoundException("Facility not found: " + facilityId);
        }
    }

    private void verifyUnitOwnership(Long unitId, Long orgId) {
        if (orgId == null) return;
        if (!unitRepository.existsByIdAndFacilityOrganizationId(unitId, orgId)) {
            throw new NotFoundException("Unit not found: " + unitId);
        }
    }
}
