package com.cura.staff.dto;

import jakarta.validation.constraints.NotBlank;

public record StaffStatusPatchRequest(@NotBlank String status) {}
