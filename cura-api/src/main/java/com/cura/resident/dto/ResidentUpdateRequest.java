package com.cura.resident.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ResidentUpdateRequest(
        @Size(max = 100)
        String firstName,

        @Size(max = 100)
        String lastName,
        LocalDate dateOfBirth,

        @Size(max = 50)
        String roomNumber
) {}
