package com.farmapp.farmsmartmanagement.config.storage;

import com.farmapp.farmsmartmanagement.config.app.R2Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@RequiredArgsConstructor
public class R2Config {

    private final R2Properties r2Properties;

    // R2 endpoint: https://<accountId>.r2.cloudflarestorage.com
    private URI r2Endpoint() {
        return URI.create("https://" + r2Properties.getAccountId() + ".r2.cloudflarestorage.com");
    }

    private StaticCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(
                        r2Properties.getAccessKeyId(),
                        r2Properties.getSecretAccessKey()
                )
        );
    }

    @Bean
    public S3Client r2S3Client() {
        return S3Client.builder()
                .endpointOverride(r2Endpoint())
                .credentialsProvider(credentialsProvider())
                .region(Region.of("auto")) // R2 dùng "auto"
                .forcePathStyle(true)      // Bắt buộc với R2
                .build();
    }

    @Bean
    public S3Presigner r2S3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(r2Endpoint())
                .credentialsProvider(credentialsProvider())
                .region(Region.of("auto"))
                .build();
    }
}