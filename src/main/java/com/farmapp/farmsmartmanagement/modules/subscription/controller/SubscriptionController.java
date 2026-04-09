package com.farmapp.farmsmartmanagement.modules.subscription.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.FarmSubscriptionResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.service.FarmSubscriptionService;
import com.farmapp.farmsmartmanagement.modules.subscription.service.SubscriptionPlanService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubscriptionController {

    SubscriptionPlanService subscriptionPlanService;
    FarmSubscriptionService farmSubscriptionService;

    @GetMapping("/api/v1/subscriptions")
    public ApiResponse<List<SubscriptionPlanResponse>> getAllSubscriptions() {
        return ApiResponse.success(subscriptionPlanService.findAll());
    }

    @GetMapping("/api/v1/subscriptions/history")
    public ApiResponse<List<FarmSubscriptionResponse>> getFarmSubscriptionHistory(
            @AuthenticationPrincipal UserPrincipal principal
    ){
        UUID farmId = principal.getFarmId();

        return ApiResponse.success(
                farmSubscriptionService.getFarmSubscriptionHistory(farmId)
        );
    }

    @GetMapping("/api/v1/subscriptions/current")
    public ApiResponse<FarmSubscriptionResponse> getCurrentFarmSubscription(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        UUID farmId = userPrincipal.getFarmId();

        return ApiResponse.success(
                farmSubscriptionService.getCurrentFarmSubscription(farmId)
        );
    }
}
