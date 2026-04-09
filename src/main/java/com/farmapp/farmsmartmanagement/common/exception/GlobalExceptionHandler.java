package com.farmapp.farmsmartmanagement.common.exception;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.hibernate.exception.ConstraintViolationException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================== AppException ====================
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        log.warn("AppException: [{}] {}", errorCode.name(), ex.getMessage());
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.getCode(), ex.getMessage()));
    }

    // ==================== Validation ====================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        log.warn("Validation failed: {}", errors);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .code(400)
                        .message("Dữ liệu đầu vào không hợp lệ")
                        .data(errors)
                        .build());
    }

    // ==================== JSON Parse Error ====================
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<String>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {
        String message = "Dữ liệu không hợp lệ";
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife) {
            String fieldName = ife.getPath().isEmpty() ? "unknown"
                    : ife.getPath().get(0).getFieldName();
            message = "Giá trị không hợp lệ cho field: " + fieldName;
        }
        log.warn("HttpMessageNotReadable: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<String>builder()
                        .success(false)
                        .code(400)
                        .message(message)
                        .build());
    }

    // ==================== IllegalArgument ====================
    // Đặt TRƯỚC Exception.class fallback cho rõ ràng
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("IllegalArgumentException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, "Dữ liệu không hợp lệ: " + ex.getMessage()));
    }

    // ==================== Security ====================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, ErrorCode.FORBIDDEN.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, ErrorCode.UNAUTHORIZED.getMessage()));
    }

    // ==================== Database / JPA ====================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("DataIntegrityViolationException: {}", ex.getMessage());

        String message = ErrorCode..getMessage();

        // Phân biệt unique constraint vs foreign key
        Throwable cause = ex.getCause();
        if (cause instanceof ConstraintViolationException cve) {
            String constraintName = cve.getConstraintName();
            if (constraintName != null) {
                if (constraintName.contains("email")) {
                    message = ErrorCode.EMAIL_EXISTED.getMessage();
                } else if (constraintName.contains("farm")) {
                    message = ErrorCode.FARM_NOT_FOUND.getMessage();
                }
                // thêm các constraint khác nếu cần
            }
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(409, message));
    }

    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<ApiResponse<Void>> handleJpaSystemException(JpaSystemException ex) {
        log.error("JpaSystemException: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }

    // ==================== Fallback (luôn đặt cuối) ====================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}