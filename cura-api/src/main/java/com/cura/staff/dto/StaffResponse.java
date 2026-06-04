package com.cura.staff.dto;

import java.time.Instant;

public record StaffResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String employeeNumber,
    String username,
    String jobTitle,
    String department,
    String employmentType,
    String status,
    String hireDate,
    Instant createdAt
) {}
