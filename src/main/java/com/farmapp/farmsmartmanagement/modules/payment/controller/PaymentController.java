package com.farmapp.farmsmartmanagement.modules.payment.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.config.app.SepayProperties;
import com.farmapp.farmsmartmanagement.infrastructure.payment.SepayService;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.CreatePaymentRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.SepayIpnRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.CreatePaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Thanh toán subscription qua SePay")
public class PaymentController {

    private final SepayService sepayService;
    private final SepayProperties sepayProperties;

    /**
     * Tạo link thanh toán SePay.
     * FE nhận paymentUrl rồi redirect user sang trang SePay.
     */
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo link thanh toán SePay")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request) {

        CreatePaymentResponse response = sepayService.createPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * IPN endpoint — SePay POST đến đây khi giao dịch hoàn tất (server-to-server).
     * KHÔNG cần JWT. Phải trả HTTP 200 để SePay không retry.
     */
    @PostMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(
            @RequestBody SepayIpnRequest ipnRequest) {

        log.info("[IPN] notification_type={}", ipnRequest.getNotificationType());

        try {
            sepayService.handleIpn(ipnRequest);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            log.error("[IPN] Processing error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}