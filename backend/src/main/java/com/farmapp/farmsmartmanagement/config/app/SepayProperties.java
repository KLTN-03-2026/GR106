package com.farmapp.farmsmartmanagement.config.app;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@ConfigurationProperties(prefix = "payment.sepay")
@Component
public class SepayProperties {
    private String merchantCode;
    private String secretKey;
    private String paymentUrl;   // https://pay-sandbox.sepay.vn/v1/checkout/init
    private String returnUrl;    // base URL, FE sẽ thêm /success, /error, /cancel
}