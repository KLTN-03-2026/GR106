package com.farmapp.farmsmartmanagement.modules.payment.dto.request;

import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotNull(message = "subscriptionPlanId is required")
    private UUID subscriptionPlanId;

    @NotNull(message = "billingCycle is required")
    private BillingCycle billingCycle;
}