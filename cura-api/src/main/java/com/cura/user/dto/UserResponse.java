package com.cura.user.dto;

import com.cura.user.UserRole;

public record UserResponse(
        Long id,
        String username,
        UserRole role
) {}
