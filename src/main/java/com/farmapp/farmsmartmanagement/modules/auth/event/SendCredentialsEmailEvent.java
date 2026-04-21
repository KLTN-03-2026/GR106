package com.farmapp.farmsmartmanagement.modules.auth.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

// SendCredentialsEmailEvent.java
@Getter
public class SendCredentialsEmailEvent extends ApplicationEvent {
    private final String fullName;
    private final String email;
    private final String rawPassword;
    private final String farmName;
    private final String loginLink;

    public SendCredentialsEmailEvent(Object source, String fullName,
                                     String email, String rawPassword,
                                     String farmName, String loginLink) {
        super(source);
        this.fullName    = fullName;
        this.email       = email;
        this.rawPassword = rawPassword;
        this.farmName    = farmName;
        this.loginLink   = loginLink;
    }
}
