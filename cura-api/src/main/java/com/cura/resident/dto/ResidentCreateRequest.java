package com.cura.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResidentCreateRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must be <= 100 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must be <= 100 characters")
        String lastName,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @Size(max = 20, message = "Room number must be <= 20 characters")
        String roomNumber,

        @Size(max = 100) String condition,
        @Size(max = 50)  String careLevel,
        @Size(max = 50)  String status,
        @Size(max = 100) String gpName,
        @Size(max = 100) String emergencyContactName,
        @Size(max = 30)  String emergencyContactPhone,
        @Size(max = 100) String emergencyContactRelationship,

        Long roomId,

        @Size(max = 50)  String gender,
        LocalDate admissionDate,
        @Size(max = 20)  String nhsNumber,
        @Size(max = 255) String carePlan
) {}
