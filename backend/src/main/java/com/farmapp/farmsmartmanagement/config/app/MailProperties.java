package com.farmapp.farmsmartmanagement.config.app;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sendgrid")
@Getter
@Setter
public class MailProperties {
    private String apiKey;
    private String fromEmail;
    private String fromName;
}