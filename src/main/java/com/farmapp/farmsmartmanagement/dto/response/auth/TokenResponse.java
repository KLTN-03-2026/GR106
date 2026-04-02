package com.farmapp.farmsmartmanagement.dto.response.auth;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {}