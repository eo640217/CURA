package com.cura.resident.dto;

import java.time.Instant;
import java.time.LocalDate;

public record ResidentResponse(
        Long id,
        Long facilityId,
        Long unitId,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String roomNumber,
        Instant createdAt
) {}
