package com.cura.activity;

import com.cura.activity.dto.ActivityItemResponse;
import com.cura.activity.dto.ActivityItemResponse.ActivityStatus;
import com.cura.activity.dto.ActivityItemResponse.ActivityType;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    public List<ActivityItemResponse> listRecent(int limit, String actor) {
        // Mocked items (later replace with DB-backed queries)
        List<ActivityItemResponse> items = List.of(
                new ActivityItemResponse(
                        UUID.randomUUID().toString(),
                        ActivityType.RESIDENT,
                        "Resident Transfer Request",
                        ActivityStatus.COMPLETED,
                        OffsetDateTime.now().minusHours(2),
                        actor
                ),
                new ActivityItemResponse(
                        UUID.randomUUID().toString(),
                        ActivityType.FACILITY,
                        "Facility Document Uploaded",
                        ActivityStatus.PENDING,
                        OffsetDateTime.now().minusDays(1),
                        actor
                ),
                new ActivityItemResponse(
                        UUID.randomUUID().toString(),
                        ActivityType.INCIDENT,
                        "Incident Report Created",
                        ActivityStatus.IN_REVIEW,
                        OffsetDateTime.now().minusDays(2),
                        actor
                ),
                new ActivityItemResponse(
                        UUID.randomUUID().toString(),
                        ActivityType.UNIT,
                        "Unit Capacity Updated",
                        ActivityStatus.COMPLETED,
                        OffsetDateTime.now().minusDays(3),
                        actor
                ),
                new ActivityItemResponse(
                        UUID.randomUUID().toString(),
                        ActivityType.HOURS,
                        "Hours Submitted For Approval",
                        ActivityStatus.PENDING,
                        OffsetDateTime.now().minusDays(4),
                        actor
                )
        );

        // Respect limit
        return items.subList(0, Math.min(limit, items.size()));
    }
}