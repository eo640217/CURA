package com.cura.facility.dto;

import com.cura.facility.Facility;
import java.time.Instant;

public record FacilityResponse(
        Long id,
        String name,
        String address,
        Instant createdAt
) {
    public static FacilityResponse from(Facility f) {
        return new FacilityResponse(
                f.getId(),
                f.getName(),
                f.getAddress(),
                f.getCreatedAt()
        );
    }
}
