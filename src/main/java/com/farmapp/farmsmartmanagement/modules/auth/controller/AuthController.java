package com.farmapp.farmsmartmanagement.modules.auth.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;

import com.farmapp.farmsmartmanagement.modules.auth.dto.request.LoginRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RefreshRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RegisterRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.VerifyRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.response.TokenResponse;
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