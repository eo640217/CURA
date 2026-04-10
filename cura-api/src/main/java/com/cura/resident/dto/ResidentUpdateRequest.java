package com.cura.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ResidentUpdateRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must be <= 100 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must be <= 100 characters")
        String lastName,

        @NotBlank(message = "Date of birth is required")
        LocalDate dateOfBirth,

        @NotBlank(message = "Room number is required")
        @Size(max = 50, message = "Room number must be <= 50 characters")
        String roomNumber
) {}
