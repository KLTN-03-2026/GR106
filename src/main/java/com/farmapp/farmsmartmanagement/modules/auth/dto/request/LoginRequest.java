package com.farmapp.farmsmartmanagement.modules.auth.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @Sanitize
        @NotBlank(message = "Email không được để trống")
        @Email
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {}