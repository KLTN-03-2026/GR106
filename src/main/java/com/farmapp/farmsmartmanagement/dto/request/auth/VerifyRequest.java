package com.farmapp.farmsmartmanagement.dto.request.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyRequest(
        @NotBlank String token
) {}