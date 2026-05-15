package com.farmapp.farmsmartmanagement.modules.auth.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;

import com.farmapp.farmsmartmanagement.modules.auth.dto.request.LoginRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RefreshRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RegisterRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.VerifyRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.response.TokenResponse;
import com.farmapp.farmsmartmanagement.modules.auth.service.AuthService;
import com.farmapp.farmsmartmanagement.modules.auth.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@Tag(name = "Auth API", description = "Xác thực người dùng (đăng ký, đăng nhập, refresh token)")
public class AuthController {

    RefreshTokenService refreshTokenService;
    AuthService authService;

    @Operation(
            summary = "Đăng ký tài khoản",
            description = "API cho phép người dùng đăng ký tài khoản mới"
    )
    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest registerRequest){
        authService.register(registerRequest);
        return ApiResponse.noContent(
        );
    }

    @Operation(
            summary = "Đăng nhập",
            description = "API xác thực người dùng và trả về access token + refresh token"
    )
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

    @Operation(
            summary = "Gửi lại mail"
    )
    @PostMapping("/register/resend-mail")
    public ApiResponse<Void> resendMail(
            @RequestBody LoginRequest req,
            HttpServletRequest request
    ) {
        authService.resendMailRegister(req);
        return ApiResponse.noContent();
    }

    @Operation(
            summary = "Xác thực email / tài khoản",
            description = "API dùng để xác thực tài khoản thông qua token (thường gửi qua email)"
    )
    @PostMapping("/verify")
    public ApiResponse<Void> verify(@RequestBody @Valid VerifyRequest req) {
        authService.verify(req.token());
        return ApiResponse.success("Xác thực thành công", null);
    }

    @Operation(
            summary = "Làm mới access token",
            description = "API sử dụng refresh token để cấp lại access token mới"
    )
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

    @Operation(
            summary = "Test quyền ADMIN",
            description = "API dùng để kiểm tra quyền ADMIN (chỉ ADMIN mới truy cập được)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/te")
    public ApiResponse<String> te(){
        return ApiResponse.success("ping");
    }
}