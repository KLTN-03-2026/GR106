package com.farmapp.farmsmartmanagement.modules.subscription.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.service.SubscriptionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubscriptionController {

    SubscriptionService subscriptionService;

    @GetMapping("/api/v1/subscriptions")
    public ApiResponse<List<SubscriptionPlanResponse>> getAllSubscriptions() {
        return ApiResponse.success(subscriptionService.findAll());
    }
}
