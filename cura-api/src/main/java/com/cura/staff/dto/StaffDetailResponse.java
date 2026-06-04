package com.cura.staff.dto;

import java.time.Instant;
import java.util.List;

public record StaffDetailResponse(
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
    String dateOfBirth,
    String notes,
    Long userId,
    List<FacilitySummary> facilities,
    Instant createdAt,
    Instant updatedAt
) {
    public record FacilitySummary(Long id, String name) {}
}
