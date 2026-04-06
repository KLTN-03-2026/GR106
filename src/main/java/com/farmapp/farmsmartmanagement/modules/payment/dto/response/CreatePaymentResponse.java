package com.farmapp.farmsmartmanagement.modules.payment.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PaymentGateway;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// ─── CreatePaymentResponse ────────────────────────────────────────
@Data
@Builder
public class CreatePaymentResponse {

    private UUID transactionId;

    /** URL redirect sang VNPay — FE redirect người dùng tới đây */
    private String paymentUrl;

    private String orderCode;

    private BigDecimal amount;

    private LocalDateTime expiredAt;
}