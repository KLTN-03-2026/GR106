package com.farmapp.farmsmartmanagement.dto.request.auth;

public record LoginRequest(
        String email,
        String password
) {}