package com.cura.organization.dto;

public record OrgBrandingResponse(
    Long id,
    String orgName,
    String orgCode,
    String logoUrl,
    String primaryColor
) {}
