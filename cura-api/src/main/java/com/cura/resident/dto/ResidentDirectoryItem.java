package com.cura.resident.dto;

import com.cura.unit.UnitType;
import java.time.LocalDate;

public record ResidentDirectoryItem(
        Long residentId,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String roomNumber,

        Long unitId,
        String unitName,
        UnitType unitType,
        Integer unitCapacity,

        Long facilityId,
        String facilityName
) {}
