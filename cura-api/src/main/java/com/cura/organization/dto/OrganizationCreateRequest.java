package com.cura.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OrganizationCreateRequest(
    @NotBlank String name,
    @NotBlank @Size(min = 2, max = 20)
    @Pattern(regexp = "^[A-Z0-9]+$", message = "orgCode must be uppercase letters and digits only")
    String orgCode,
    String planTier,
    String contactEmail,
    String phone
) {}
