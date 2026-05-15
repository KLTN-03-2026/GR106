package com.farmapp.farmsmartmanagement.common.response;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseUtil<A> {

    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(data));
    }

    public static ResponseEntity<ApiResponse<Void>> noContent() {
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.noContent());
    }

    public static ResponseEntity<ApiResponse<Void>> error(HttpStatus status, String message) {
        return ResponseEntity
                .status(status)
                .body(ApiResponse.error(status.value(), message));
    }
}