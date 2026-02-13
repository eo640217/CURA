package com.cura.resident.dto;

import jakarta.validation.constraints.NotNull;

public record ResidentTransferRequest(
        @NotNull Long toUnitId,
        String roomNumber
) {}
