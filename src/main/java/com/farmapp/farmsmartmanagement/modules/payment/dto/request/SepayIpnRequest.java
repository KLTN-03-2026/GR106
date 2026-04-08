package com.farmapp.farmsmartmanagement.modules.payment.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class SepayIpnRequest {

    @JsonProperty("timestamp")
    private Long timestamp;

    @JsonProperty("notification_type")
    private String notificationType;

    @JsonProperty("order")
    private OrderData order;

    @JsonProperty("transaction")
    private TransactionData transaction;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderData {
        @JsonProperty("id")
        private String id;

        @JsonProperty("order_id")
        private String orderId;

        @JsonProperty("order_status")
        private String orderStatus;

        @JsonProperty("order_currency")
        private String orderCurrency;

        @JsonProperty("order_amount")
        private BigDecimal orderAmount;

        @JsonProperty("order_invoice_number")
        private String orderInvoiceNumber;  // ← đây chính là orderCode FSM...

        @JsonProperty("order_description")
        private String orderDescription;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransactionData {
        @JsonProperty("id")
        private String id;

        @JsonProperty("transaction_id")
        private String transactionId;

        @JsonProperty("transaction_type")
        private String transactionType;

        @JsonProperty("transaction_date")
        private String transactionDate;

        @JsonProperty("transaction_status")
        private String transactionStatus;

        @JsonProperty("transaction_amount")
        private BigDecimal transactionAmount;

        @JsonProperty("payment_method")
        private String paymentMethod;
    }
}