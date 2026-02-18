package com.cura.auth.dto;

import com.cura.user.UserRole;

public record RegisterResponse(
        Long id,
        String username,
        UserRole role
) {}
