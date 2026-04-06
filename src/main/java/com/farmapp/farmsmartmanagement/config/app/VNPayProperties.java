package com.farmapp.farmsmartmanagement.config.app;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VNPayProperties {

    /** TMN Code từ VNPay merchant portal */
    private String tmnCode;

    /** Hash secret key */
    private String hashSecret;

    /** URL endpoint của VNPay sandbox/production */
    private String payUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    /** URL backend nhận IPN callback từ VNPay */
    private String ipnUrl;

    /** URL frontend redirect sau khi thanh toán */
    private String returnUrl;

    /** API query URL để kiểm tra trạng thái giao dịch */
    private String queryUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    /** Phiên bản API VNPay */
    private String version = "2.1.0";

    /** Command */
    private String command = "pay";

    /** Loại tiền tệ */
    private String currCode = "VND";

    /** Locale */
    private String locale = "vn";

    /** Thời gian hết hạn thanh toán (phút) */
    private int expireMinutes = 15;
}