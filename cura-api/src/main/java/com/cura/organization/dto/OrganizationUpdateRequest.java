package com.cura.organization.dto;

import jakarta.validation.constraints.NotBlank;

public record OrganizationUpdateRequest(
    @NotBlank String name,
    String contactEmail,
    String phone
) {}
