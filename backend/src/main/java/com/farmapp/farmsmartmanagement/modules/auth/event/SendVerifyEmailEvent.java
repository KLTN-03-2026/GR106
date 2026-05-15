// SendVerifyEmailEvent.java
package com.farmapp.farmsmartmanagement.modules.auth.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SendVerifyEmailEvent extends ApplicationEvent {

    private final String fullName;
    private final String email;
    private final String link;

    public SendVerifyEmailEvent(Object source, String fullName, String email, String link) {
        super(source);
        this.fullName = fullName;
        this.email = email;
        this.link = link;
    }
}