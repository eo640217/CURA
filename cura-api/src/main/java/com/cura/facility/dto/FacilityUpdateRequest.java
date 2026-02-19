package com.cura.facility.dto;

import jakarta.validation.constraints.Size;

public record FacilityUpdateRequest(
        @Size(max = 120) String name,
        @Size(max = 255) String address
) {}
