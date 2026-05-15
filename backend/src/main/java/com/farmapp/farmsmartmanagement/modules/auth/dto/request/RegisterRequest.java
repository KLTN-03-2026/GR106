package com.farmapp.farmsmartmanagement.modules.auth.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record RegisterRequest(

        @Sanitize
        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được để trống")
        String email,

        @Sanitize
        @NotBlank(message = "Password không được để trống")
        String password,

        @Sanitize
        @NotBlank(message = "Tên không được để trống")
        String fullName
) {}