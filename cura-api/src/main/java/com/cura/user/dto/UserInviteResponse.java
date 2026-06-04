package com.cura.user.dto;

public record UserInviteResponse(
    Long id,
    String username,
    String userNumber,
    String role,
    String setupLink
) {}
