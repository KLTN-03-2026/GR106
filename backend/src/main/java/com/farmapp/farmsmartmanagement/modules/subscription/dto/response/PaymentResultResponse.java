package com.farmapp.farmsmartmanagement.modules.subscription.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResultResponse {
    String orderCode;
    PaymentStatus status;
    BigDecimal amount;
    LocalDateTime paidAt;
    String subscriptionName;
}
