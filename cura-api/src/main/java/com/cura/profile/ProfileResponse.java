package com.cura.profile;

public record ProfileResponse(
    Long userId,
    String username,
    String role,
    StaffSummary staffMember
) {
    public record StaffSummary(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String employeeNumber,
        String jobTitle,
        String department,
        String employmentType,
        String status,
        String hireDate
    ) {}
}
