package com.farmapp.farmsmartmanagement.config.app;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cloudflare.r2")
public class R2Properties {
    private String accountId;
    private String accessKeyId;
    private String secretAccessKey;
    private String bucketName;
    private String publicBaseUrl; // URL public để truy cập file sau khi upload
    private long presignedUrlExpirationSeconds = 300; // 5 phút mặc định
}