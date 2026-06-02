package com.cura.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResidentTransferRequest(
        @NotBlank(message = "Unit ID is required")
        @NotNull Long toUnitId,

        @NotBlank(message = "Room number is required")
        String roomNumber
) {}
