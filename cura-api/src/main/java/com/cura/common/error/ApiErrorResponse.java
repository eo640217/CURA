package com.cura.common.error;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String code,
        String error,
        String message,
        String path,
        List<FieldViolation> violations
) {
}

