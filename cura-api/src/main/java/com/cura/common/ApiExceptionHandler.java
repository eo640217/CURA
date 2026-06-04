package com.cura.common;

import com.cura.common.error.ApiErrorResponse;
import com.cura.common.error.ApiException;
import com.cura.common.error.ErrorCode;
import com.cura.common.error.FieldViolation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleBodyValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        List<FieldViolation> violations = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toViolation)
                .toList();

        String summary = violations.stream()
                .map(v -> v.field() + ": " + v.message())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");

        return ResponseEntity.badRequest().body(buildBody(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                summary,
                request,
                violations
        ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleParamValidation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        List<FieldViolation> violations = ex.getConstraintViolations()
                .stream()
                .map(v -> new FieldViolation(
                        v.getPropertyPath().toString(),
                        v.getMessage(),
                        v.getInvalidValue()))
                .toList();

        String summary = violations.stream()
                .map(v -> v.field() + ": " + v.message())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Parameter validation failed");

        return ResponseEntity.badRequest().body(buildBody(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                summary,
                request,
                violations
        ));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex,
            HttpServletRequest request) {

        return ResponseEntity.badRequest().body(buildBody(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                "Required parameter '" + ex.getParameterName() + "' of type " + ex.getParameterType() + " is missing",
                request,
                List.of()
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableBody(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        String cause = ex.getMostSpecificCause().getMessage();
        String msg = cause != null ? "Malformed request body: " + cause : "Malformed or missing request body";
        return ResponseEntity.badRequest().body(buildBody(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                msg,
                request,
                List.of()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        String msg = ex.getMessage() != null ? ex.getMessage() : "Invalid argument value";
        return ResponseEntity.badRequest().body(buildBody(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                msg,
                request,
                List.of()
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        String cause = ex.getMostSpecificCause().getMessage();
        String detail = resolveConstraintMessage(cause);
        log.warn("Data integrity violation on {} {}: {}", request.getMethod(), request.getRequestURI(), cause);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(buildBody(
                HttpStatus.CONFLICT,
                ErrorCode.CONFLICT,
                detail,
                request,
                List.of()
        ));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            NotFoundException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildBody(
                HttpStatus.NOT_FOUND,
                ErrorCode.NOT_FOUND,
                ex.getMessage(),
                request,
                List.of()
        ));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(
            ConflictException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(buildBody(
                HttpStatus.CONFLICT,
                ErrorCode.CONFLICT,
                ex.getMessage(),
                request,
                List.of()
        ));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(
            ApiException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus()).body(buildBody(
                ex.getStatus(),
                ex.getCode(),
                ex.getMessage(),
                request,
                List.of()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled exception on {} {}", request.getMethod(), request.getRequestURI(), ex);
        String detail = ex.getClass().getSimpleName();
        if (ex.getMessage() != null) detail += ": " + ex.getMessage();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildBody(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_ERROR,
                "Internal server error — " + detail,
                request,
                List.of()
        ));
    }

    private String resolveConstraintMessage(String dbMessage) {
        if (dbMessage == null) return "A database constraint was violated";
        String m = dbMessage.toLowerCase();
        if (m.contains("email"))           return "Email address is already in use";
        if (m.contains("employee_number")) return "Employee number is already in use";
        if (m.contains("username"))        return "Username is already in use";
        if (m.contains("license_number"))  return "License number is already in use";
        return "A unique constraint was violated";
    }

    private FieldViolation toViolation(FieldError e) {
        return new FieldViolation(
                e.getField(),
                e.getDefaultMessage(),
                e.getRejectedValue()
        );
    }

    private ApiErrorResponse buildBody(
            HttpStatus status,
            ErrorCode code,
            String message,
            HttpServletRequest request,
            List<FieldViolation> violations) {
        return new ApiErrorResponse(
                Instant.now(),
                status.value(),
                code.name(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                violations
        );
    }
}
