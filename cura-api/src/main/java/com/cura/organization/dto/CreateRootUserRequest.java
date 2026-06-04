package com.cura.organization.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateRootUserRequest(@NotBlank String username) {}
