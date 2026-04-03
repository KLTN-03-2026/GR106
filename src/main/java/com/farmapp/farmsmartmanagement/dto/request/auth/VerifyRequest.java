package com.farmapp.farmsmartmanagement.dto.request.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyRequest(
        @NotBlank(message = "Xác thực tài khoản thất bại, vui lòng kiểm tra lại token") String token
) {}