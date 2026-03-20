package com.cura.resident.dto;

import jakarta.validation.constraints.NotBlank;

public record ResidentNoteCreateRequest(
        @NotBlank String body
) {}