package com.farmapp.farmsmartmanagement.modules.payment.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PaymentGateway;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PaymentTransactionResponse {

    private UUID id;
    private String orderCode;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String currency;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private String bankCode;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
}