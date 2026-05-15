package com.farmapp.farmsmartmanagement.modules.payment.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.config.app.SepayProperties;
import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.infrastructure.payment.SepayService;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.CreatePaymentRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.SepayIpnRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.CreatePaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Tag(name = "Payment API", description = "Thanh toán subscription qua SePay")
public class PaymentController {

    private final SepayService sepayService;
    private final SepayProperties sepayProperties;

    // ========================= 1. CREATE PAYMENT =========================
    @Operation(
            summary = "Tạo link thanh toán SePay",
            description = "FE nhận paymentUrl từ API và redirect người dùng sang SePay để thanh toán",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/create")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,

            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal
    ) {

        CreatePaymentResponse response = sepayService.createPayment(
                principal.getUserId(),
                principal.getFarmId(),
                request
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========================= 2. IPN =========================
    @Operation(
            summary = "IPN callback từ SePay",
            description = "SePay sẽ gọi API này khi thanh toán hoàn tất (server-to-server). KHÔNG yêu cầu JWT"
    )
    @PostMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(
            @RequestBody SepayIpnRequest ipnRequest
    ) {

        log.info("[IPN] notification_type={}", ipnRequest.getNotificationType());

        try {
            sepayService.handleIpn(ipnRequest);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            log.error("[IPN] Processing error: {}", e.getMessage());
            return ResponseEntity.ok(
                    Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    )
            );
        }
    }
}