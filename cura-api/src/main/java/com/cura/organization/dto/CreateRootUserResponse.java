package com.cura.organization.dto;

public record CreateRootUserResponse(
    Long id,
    String username,
    String userNumber,
    String setupLink
) {}
