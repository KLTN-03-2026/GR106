package com.farmapp.farmsmartmanagement.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Kết quả sau khi xử lý callback từ VNPay (IPN hoặc Return URL).
 */
@Data
@Builder
public class VNPayCallbackResult {

    private boolean signatureValid;
    private boolean success;

    private String orderCode;
    private String gatewayTxnId;
    private String responseCode;
    private String transactionStatus;
    private String bankCode;
    private BigDecimal amount;

    /** Raw params từ VNPay để lưu audit */
    private Map<String, String> rawParams;

    /** Message trả về cho VNPay IPN endpoint */
    private String ipnMessage;

    public static VNPayCallbackResult invalidSignature() {
        return VNPayCallbackResult.builder()
                .signatureValid(false)
                .success(false)
                .ipnMessage("Invalid signature")
                .build();
    }
}