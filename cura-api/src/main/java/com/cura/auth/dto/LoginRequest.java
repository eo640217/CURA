package com.cura.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        // Mode 1: org code + user number (ADMIN / STAFF)
        String orgCode,
        String userNumber,

        // Mode 2: username only (SUPER_ADMIN)
        String username,

        @NotBlank String password
) {}
