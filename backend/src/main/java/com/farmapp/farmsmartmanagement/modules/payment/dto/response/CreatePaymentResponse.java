package com.farmapp.farmsmartmanagement.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CreatePaymentResponse {
    private UUID transactionId;
    private String orderCode;
    private String amount;
    private String currency;
    private String status;
    private String expiredAt;

    // Thay paymentUrl bằng formData để FE tự build form POST
    private SepayFormData formData;

    @Data
    @Builder
    public static class SepayFormData {
        private String actionUrl;      // endpoint POST
        private String orderAmount;
        private String merchant;
        private String currency;
        private String operation;
        private String orderDescription;
        private String orderInvoiceNumber;
        private String successUrl;
        private String errorUrl;
        private String cancelUrl;
        private String signature;
    }
}