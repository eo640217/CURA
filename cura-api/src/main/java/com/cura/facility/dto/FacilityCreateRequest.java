package com.cura.facility.dto;

import jakarta.validation.constraints.NotBlank;

public record FacilityCreateRequest(
        @NotBlank String name,
        @NotBlank String address
) {}
