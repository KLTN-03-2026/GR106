package com.farmapp.farmsmartmanagement.modules.subscription.dto.request;

import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UpgradeSubscriptionRequest {

    @NotNull
    private UUID farmId;

    @NotNull
    private UUID newPlanId;

    private BillingCycle billingCycle;
}