// SendFarmInvitationEvent.java
package com.farmapp.farmsmartmanagement.modules.farm.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SendFarmInvitationEvent extends ApplicationEvent {

    private final String fullName;
    private final String email;
    private final String farmName;
    private final String farmLink;

    public SendFarmInvitationEvent(Object source, String fullName,
                                   String email, String farmName, String farmLink) {
        super(source);
        this.fullName = fullName;
        this.email    = email;
        this.farmName = farmName;
        this.farmLink = farmLink;
    }
}