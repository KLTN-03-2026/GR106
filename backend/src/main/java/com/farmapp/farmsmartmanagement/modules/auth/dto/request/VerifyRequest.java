package com.farmapp.farmsmartmanagement.modules.auth.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;

public record VerifyRequest(
        @Sanitize
        @NotBlank(message = "Xác thực tài khoản thất bại, vui lòng kiểm tra lại token")
        String token
) {}