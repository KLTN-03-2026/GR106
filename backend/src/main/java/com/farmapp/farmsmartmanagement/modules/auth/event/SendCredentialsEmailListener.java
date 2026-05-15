package com.farmapp.farmsmartmanagement.modules.auth.event;

import com.farmapp.farmsmartmanagement.infrastructure.service.EmailService;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

// SendCredentialsEmailListener.java
@Slf4j
@Component
@RequiredArgsConstructor
public class SendCredentialsEmailListener {

    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(SendCredentialsEmailEvent event) {
        try {
            String html = emailTemplateService.buildCredentialsEmail(
                    event.getFullName(),
                    event.getEmail(),
                    event.getRawPassword(),
                    event.getFarmName(),
                    event.getLoginLink()
            );
            emailService.sendHtml(event.getEmail(),
                    "Bạn được mời tham gia " + event.getFarmName(), html);
        } catch (Exception e) {
            log.error("Failed to send credentials email to {}: {}",
                    event.getEmail(), e.getMessage());
        }
    }
}