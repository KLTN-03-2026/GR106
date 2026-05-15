package com.farmapp.farmsmartmanagement.modules.subscription.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.PaymentResultResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.FarmSubscriptionResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.service.FarmSubscriptionService;
import com.farmapp.farmsmartmanagement.modules.subscription.service.SubscriptionPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Subscription API", description = "Quản lý gói đăng ký và subscription của farm")
public class SubscriptionController {

    SubscriptionPlanService subscriptionPlanService;
    FarmSubscriptionService farmSubscriptionService;

    // ========================= 1. GET ALL PLANS =========================
    @Operation(
            summary = "Lấy danh sách gói subscription",
            description = "API trả về tất cả các gói dịch vụ (FREE, BASIC, PRO, ...)"
    )
    @GetMapping("/api/v1/subscriptions")
    public ApiResponse<List<SubscriptionPlanResponse>> getAllSubscriptions() {
        return ApiResponse.success(subscriptionPlanService.findAll());
    }

    // ========================= 2. HISTORY =========================
    @Operation(
            summary = "Lấy lịch sử subscription của farm",
            description = "Trả về toàn bộ lịch sử đăng ký gói của farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/subscriptions/history")
    public ApiResponse<List<FarmSubscriptionResponse>> getFarmSubscriptionHistory(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal
    ){
        UUID farmId = principal.getFarmId();

        return ApiResponse.success(
                farmSubscriptionService.getFarmSubscriptionHistory(farmId)
        );
    }

    // ========================= 3. CURRENT =========================
    @Operation(
            summary = "Lấy subscription hiện tại của farm",
            description = "Trả về gói subscription đang active của farm",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @RequiresFarmToken
    @GetMapping("/api/v1/subscriptions/current")
    public ApiResponse<FarmSubscriptionResponse> getCurrentFarmSubscription(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        UUID farmId = userPrincipal.getFarmId();

        return ApiResponse.success(
                farmSubscriptionService.getCurrentFarmSubscription(farmId)
        );
    }

    @GetMapping("/api/v1/payments/result")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PaymentResultResponse>> getPaymentResult(
            @RequestParam("orderCode") String orderCode
    ){
        return ResponseUtil.success(
                farmSubscriptionService.getPaymentResult(orderCode)
        );
    }
}