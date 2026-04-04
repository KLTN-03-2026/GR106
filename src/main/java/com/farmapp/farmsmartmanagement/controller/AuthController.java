package com.farmapp.farmsmartmanagement.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;

import com.farmapp.farmsmartmanagement.dto.request.auth.LoginRequest;
import com.farmapp.farmsmartmanagement.dto.request.auth.RefreshRequest;
import com.farmapp.farmsmartmanagement.dto.request.auth.RegisterRequest;
import com.farmapp.farmsmartmanagement.dto.request.auth.VerifyRequest;
import com.farmapp.farmsmartmanagement.dto.response.auth.TokenResponse;
import com.farmapp.farmsmartmanagement.modules.auth.service.AuthService;
import com.farmapp.farmsmartmanagement.modules.auth.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    RefreshTokenService refreshTokenService;
    AuthService authService;

    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest registerRequest){
        authService.register(registerRequest);
        return ApiResponse.noContent(
        );
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(
            @RequestBody LoginRequest req,
            HttpServletRequest request
    ) {
        return ApiResponse.success(
                authService.login(
                        req,
                        request.getHeader("User-Agent"),
                        request.getRemoteAddr()
                )
        );
    }

    @PostMapping("/verify")
    public ApiResponse<Void> verify(@RequestBody @Valid VerifyRequest req) {
        authService.verify(req.token());
        return ApiResponse.success("Xác thực thành công", null);
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(
            @RequestBody RefreshRequest req,
            HttpServletRequest request) {
        return ApiResponse.success(
                refreshTokenService.refresh(
                        req.refreshToken(),
                        request.getHeader("User-Agent"),
                        request.getRemoteAddr()
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/te")
    public ApiResponse<String> te(){
        return ApiResponse.success("ping");
    }
}