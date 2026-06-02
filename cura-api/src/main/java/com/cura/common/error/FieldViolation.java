package com.cura.common.error;

public record FieldViolation(
        String field,
        String message,
        Object rejectedValue
) {
}

