package com.cura.staff.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record StaffUpdateRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    String phone,
    String employeeNumber,
    String username,
    @NotBlank String jobTitle,
    @NotBlank String department,
    @NotBlank String employmentType,
    @NotNull LocalDate hireDate,
    LocalDate dateOfBirth,
    String notes
) {}
