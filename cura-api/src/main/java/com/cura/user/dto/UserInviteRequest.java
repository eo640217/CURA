package com.cura.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UserInviteRequest(
    @NotBlank String username,
    @NotBlank String role
) {}
