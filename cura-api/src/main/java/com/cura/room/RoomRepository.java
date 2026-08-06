package com.cura.room;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUnitId(Long unitId);
    List<Room> findByUnitIdAndIsOccupiedFalse(Long unitId);
}
