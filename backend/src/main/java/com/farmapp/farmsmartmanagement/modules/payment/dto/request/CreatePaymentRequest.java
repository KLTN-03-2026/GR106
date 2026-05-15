package com.farmapp.farmsmartmanagement.modules.payment.dto.request;

import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotNull(message = "Chưa chọn gói dịch vụ")
    private UUID subscriptionPlanId;

    @NotNull(message = "Chưa chọn thanh toán theo tháng hay năm")
    private BillingCycle billingCycle;
}