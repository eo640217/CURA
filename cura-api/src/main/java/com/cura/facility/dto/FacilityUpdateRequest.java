package com.cura.facility.dto;

import jakarta.validation.constraints.NotBlank;

public record FacilityUpdateRequest(
        @NotBlank String name,
        @NotBlank String address
) {}