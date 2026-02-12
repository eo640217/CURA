package com.cura.facility.dto;

import java.time.Instant;

public record FacilityResponse(
        Long id,
        String name,
        String address,
        Instant createdAt
) {}