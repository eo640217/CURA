package com.cura.activity;

import com.cura.activity.dto.ActivityItemResponse;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/activity")
public class ActivityController {

    private final ActivityService service;

    public ActivityController(ActivityService service) {
        this.service = service;
    }

    @GetMapping
    public List<ActivityItemResponse> list(@RequestParam(defaultValue = "10") int limit,
                                           Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        int safeLimit = Math.max(1, Math.min(limit, 50));
        return service.listRecent(safeLimit, actor);
    }
}