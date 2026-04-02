package com.farmapp.farmsmartmanagement.dto.request.auth;

import java.util.UUID;

public record RefreshRequest(
        String refreshToken
) {}