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
        Instant createdAt,
        String condition,
        String careLevel,
        String status,
        String gpName,
        String emergencyContactName,
        String emergencyContactPhone,
        Long roomId,
        String gender,
        LocalDate admissionDate,
        String nhsNumber,
        String emergencyContactRelationship,
        String carePlan,
        String photoUrl
) {}
