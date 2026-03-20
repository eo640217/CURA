package com.cura.resident.dto;

import java.time.Instant;

public record ResidentNoteResponse(
        Long id,
        Long residentId,
        String body,
        Instant createdAt,
        String createdBy
) {}