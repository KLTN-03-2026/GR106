package com.farmapp.farmsmartmanagement.modules.payment.dto.request;

import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Request tạo payment link VNPay cho subscription.
 */
@Data
public class CreatePaymentRequest {

    @NotNull(message = "subscriptionPlanId is required")
    private UUID subscriptionPlanId;

    @NotNull(message = "billingCycle is required")
    private BillingCycle billingCycle;

    /** Mã ngân hàng nếu người dùng chọn trước (optional) */
    private String bankCode;

    /**
     * Nếu true → upgrade/renew subscription hiện tại.
     * Nếu false → tạo subscription mới.
     */
    private boolean isUpgrade = false;
}