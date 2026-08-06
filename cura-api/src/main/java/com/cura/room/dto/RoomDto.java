package com.cura.room.dto;

public record RoomDto(
        Long id,
        String roomNumber,
        Long unitId,
        Integer bedCount,
        boolean isOccupied
) {}
