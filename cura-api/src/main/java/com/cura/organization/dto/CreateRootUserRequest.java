package com.cura.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRootUserRequest(
    @NotBlank String username,
    @NotBlank @Size(min = 6) String password
) {}
