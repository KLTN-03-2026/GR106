package com.farmapp.farmsmartmanagement.modules.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(

        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được để trống")
        String email,

        @NotBlank(message = "Password không được để trống")
        String password,

        @NotBlank(message = "Tên không được để trống")
        String fullName
) {}