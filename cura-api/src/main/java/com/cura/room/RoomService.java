package com.cura.room;

import com.cura.common.NotFoundException;
import com.cura.room.dto.CreateRoomRequest;
import com.cura.room.dto.RoomDto;
import com.cura.unit.Unit;
import com.cura.unit.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final UnitRepository unitRepository;

    public RoomService(RoomRepository roomRepository, UnitRepository unitRepository) {
        this.roomRepository = roomRepository;
        this.unitRepository = unitRepository;
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getRoomsByUnit(Long unitId, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        return roomRepository.findByUnitId(unitId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getAvailableRoomsByUnit(Long unitId, Long orgId) {
        verifyUnitOwnership(unitId, orgId);
        return roomRepository.findByUnitIdAndIsOccupiedFalse(unitId).stream().map(this::toDto).toList();
    }

    @Transactional
    public RoomDto createRoom(CreateRoomRequest request, Long orgId) {
        verifyUnitOwnership(request.getUnitId(), orgId);
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found: " + request.getUnitId()));
        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setUnit(unit);
        room.setBedCount(request.getBedCount() != null ? request.getBedCount() : 1);
        room.setOccupied(false);
        return toDto(roomRepository.save(room));
    }

    @Transactional
    public void markOccupied(Long roomId, boolean occupied) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));
        room.setOccupied(occupied);
        roomRepository.save(room);
    }

    private void verifyUnitOwnership(Long unitId, Long orgId) {
        if (orgId == null) return;
        if (!unitRepository.existsByIdAndFacilityOrganizationId(unitId, orgId)) {
            throw new NotFoundException("Unit not found: " + unitId);
        }
    }

    private RoomDto toDto(Room room) {
        return new RoomDto(
                room.getId(),
                room.getRoomNumber(),
                room.getUnit().getId(),
                room.getBedCount(),
                room.isOccupied()
        );
    }
}
