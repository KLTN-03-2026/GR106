package com.farmapp.farmsmartmanagement.modules.payment.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.PageResponse;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.CreatePaymentRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.CreatePaymentResponse;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.PaymentTransactionResponse;
import com.farmapp.farmsmartmanagement.modules.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "VNPay payment flow")
public class PaymentController {

    private final PaymentService paymentService;

    // ─── 1. Tạo payment link ──────────────────────────────────────

    @PostMapping("/vnpay/create")
    @Operation(summary = "Tạo link thanh toán VNPay")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest,
            @AuthenticationPrincipal UserPrincipal principal
    ) {

        UUID farmId  = principal.getFarmId();
        UUID userId  = principal.getUserId();
        String ip    = resolveClientIp(httpRequest);

        CreatePaymentResponse response = paymentService.createVNPayPayment(farmId, userId, request, ip);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ─── 2. VNPay IPN (server-to-server callback) ────────────────

    /**
     * VNPay POST tới endpoint này sau khi giao dịch hoàn tất.
     * Phải public (không cần auth token) — VNPay không gửi Bearer token.
     * Trả về JSON {"RspCode":"00","Message":"Confirm Success"} theo spec VNPay.
     */
    @PostMapping(value = "/vnpay/ipn",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "VNPay IPN callback (server-to-server)")
    public ResponseEntity<String> vnpayIPN(@RequestParam Map<String, String> params) {
        log.info("[IPN] Received params keys={}", params.keySet());
        String result = paymentService.handleVNPayIPN(params);
        return ResponseEntity.ok(result);
    }

    // ─── 3. VNPay Return URL (browser redirect) ──────────────────

    /**
     * VNPay redirect browser về đây sau khi thanh toán.
     * FE thường là SPA → endpoint này trả về JSON để FE xử lý tiếp
     * (hoặc dùng redirect sang FE URL tuỳ cấu hình).
     */
    @GetMapping("/vnpay/return")
    @Operation(summary = "VNPay return URL sau khi thanh toán")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> vnpayReturn(
            @RequestParam Map<String, String> params) {
        log.info("[Return] VNPay return orderCode={}", params.get("vnp_TxnRef"));
        PaymentTransactionResponse response = paymentService.handleVNPayReturn(params);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ─── 4. Query trạng thái giao dịch ───────────────────────────

    @GetMapping("/{orderCode}/status")
    @Operation(summary = "Kiểm tra trạng thái thanh toán theo order code")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getStatus(
            @PathVariable String orderCode,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID farmId = principal.getFarmId();
        PaymentTransactionResponse response = paymentService.getByOrderCode(orderCode, farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ─── 5. Lịch sử giao dịch ─────────────────────────────────────

    @GetMapping("/history")
    @Operation(summary = "Lịch sử giao dịch của farm")
    public ResponseEntity<ApiResponse<Page<PaymentTransactionResponse>>> getHistory(
            @PageableDefault(size = 20) @ParameterObject Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID farmId = principal.getFarmId();
        Page<PaymentTransactionResponse> page = paymentService.getHistory(farmId, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    // ─── Helpers ──────────────────────────────────────────────────

    /**
     * Lấy IP thực của client, hỗ trợ các header phổ biến của proxy/load balancer.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For", "Proxy-Client-IP", "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR", "HTTP_X_FORWARDED", "HTTP_CLIENT_IP", "REMOTE_ADDR"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For có thể chứa danh sách IP, lấy cái đầu tiên
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}