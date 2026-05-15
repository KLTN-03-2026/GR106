package com.farmapp.farmsmartmanagement.modules.auth.dto.response;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {}