// SendFarmInvitationListener.java
package com.farmapp.farmsmartmanagement.modules.farm.event;

import com.farmapp.farmsmartmanagement.infrastructure.service.EmailService;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class SendFarmInvitationListener {

    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(SendFarmInvitationEvent event) {
        try {
            String html = emailTemplateService.buildFarmInvitationEmail(
                    event.getFullName(),
                    event.getFarmName(),
                    event.getFarmLink()
            );
            emailService.sendHtml(
                    event.getEmail(),
                    "Bạn được mời tham gia " + event.getFarmName(),
                    html
            );
        } catch (Exception e) {
            log.error("Failed to send farm invitation email to {}: {}",
                    event.getEmail(), e.getMessage());
        }
    }
}