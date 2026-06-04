package com.cura.organization.dto;

import java.time.Instant;

public record OrganizationResponse(
    Long id,
    String name,
    String orgCode,
    String contactEmail,
    String phone,
    Instant createdAt,
    Instant updatedAt
) {}
