package com.cura.facility;

import com.cura.common.NotFoundException;
import com.cura.facility.dto.CreateUnitWithRoomsRequest;
import com.cura.facility.dto.FacilityCreateRequest;
import com.cura.facility.dto.FacilityResponse;
import com.cura.facility.dto.FacilityUpdateRequest;
import com.cura.organization.Organization;
import com.cura.organization.OrganizationRepository;
import com.cura.room.Room;
import com.cura.room.RoomRepository;
import com.cura.unit.Unit;
import com.cura.unit.UnitRepository;
import com.cura.unit.UnitType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final OrganizationRepository orgRepository;
    private final UnitRepository unitRepository;
    private final RoomRepository roomRepository;

    public FacilityService(FacilityRepository facilityRepository, OrganizationRepository orgRepository,
                           UnitRepository unitRepository, RoomRepository roomRepository) {
        this.facilityRepository = facilityRepository;
        this.orgRepository = orgRepository;
        this.unitRepository = unitRepository;
        this.roomRepository = roomRepository;
    }

    public FacilityResponse create(FacilityCreateRequest request, Long orgId) {
        Organization org = orgRepository.findById(orgId)
                .orElseThrow(() -> new NotFoundException("Organization not found: " + orgId));
        Facility facility = new Facility(request.name(), request.address());
        facility.setOrganization(org);
        Facility saved = facilityRepository.save(facility);

        if (request.units() != null) {
            for (CreateUnitWithRoomsRequest unitReq : request.units()) {
                UnitType type = unitReq.getType() != null ? unitReq.getType() : UnitType.ROOM;
                int capacity = unitReq.getCapacity() != null ? unitReq.getCapacity() : 10;
                Unit unit = new Unit(saved, unitReq.getName(), type, capacity);
                Unit savedUnit = unitRepository.save(unit);

                if (unitReq.getRooms() != null) {
                    for (String roomNumber : unitReq.getRooms()) {
                        Room room = new Room();
                        room.setRoomNumber(roomNumber);
                        room.setUnit(savedUnit);
                        room.setBedCount(1);
                        room.setOccupied(false);
                        roomRepository.save(room);
                    }
                }
            }
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public FacilityResponse get(Long id, Long orgId) {
        verifyOwnership(id, orgId);
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Facility not found: " + id));
        return toResponse(facility);
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> list(Long orgId) {
        List<Facility> facilities = (orgId == null)
                ? facilityRepository.findAll()
                : facilityRepository.findByOrganizationId(orgId);
        return facilities.stream().map(this::toResponse).toList();
    }

    public FacilityResponse update(Long id, FacilityUpdateRequest req, Long orgId) {
        verifyOwnership(id, orgId);
        Facility f = facilityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Facility not found: " + id));
        if (req.name()    != null) f.setName(req.name());
        if (req.address() != null) f.setAddress(req.address());
        if (req.phone()   != null) f.setPhone(req.phone());
        if (req.email()   != null) f.setEmail(req.email());
        return toResponse(facilityRepository.save(f));
    }

    public void delete(Long id, Long orgId) {
        verifyOwnership(id, orgId);
        if (!facilityRepository.existsById(id)) throw new NotFoundException("Facility not found: " + id);
        facilityRepository.deleteById(id);
    }

    private void verifyOwnership(Long facilityId, Long orgId) {
        if (orgId == null) return;
        if (!facilityRepository.existsByIdAndOrganizationId(facilityId, orgId)) {
            throw new NotFoundException("Facility not found: " + facilityId);
        }
    }

    private FacilityResponse toResponse(Facility f) {
        return FacilityResponse.from(f);
    }
}
