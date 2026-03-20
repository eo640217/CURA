package com.cura.activity.dto;

import java.time.OffsetDateTime;

public record ActivityItemResponse(
        String id,
        ActivityType type,
        String title,
        ActivityStatus status,
        OffsetDateTime createdAt,
        String actor
) {
    public enum ActivityType {
        RESIDENT, FACILITY, UNIT, INCIDENT, HOURS, ADMIN
    }

    public enum ActivityStatus {
        COMPLETED, PENDING, IN_REVIEW
    }
}