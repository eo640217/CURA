package com.cura.facility.dto;

import jakarta.validation.constraints.Size;

public record FacilityUpdateRequest(
        @Size(max = 255) String name,
        @Size(max = 255) String address,
        @Size(max = 40)  String phone,
        @Size(max = 120) String email
) {}
