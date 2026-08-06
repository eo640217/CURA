package com.cura.facility.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record FacilityCreateRequest(
        @NotBlank String name,
        @NotBlank String address,
        List<CreateUnitWithRoomsRequest> units
) {}
