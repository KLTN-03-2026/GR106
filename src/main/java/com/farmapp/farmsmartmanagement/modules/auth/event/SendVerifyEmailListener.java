// SendVerifyEmailListener.java
package com.farmapp.farmsmartmanagement.modules.auth.event;

import com.farmapp.farmsmartmanagement.infrastructure.service.EmailService;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class SendVerifyEmailListener {

    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    // Chạy SAU KHI transaction commit thành công
    // Chạy ASYNC — không block response trả về client
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(SendVerifyEmailEvent event) {
        try {
            String html = emailTemplateService.buildVerifyEmail(
                    event.getFullName(), event.getLink()
            );
            emailService.sendHtml(event.getEmail(), "Xác thực tài khoản", html);
        } catch (Exception e) {
            // Email fail không rollback transaction — chỉ log
            // TODO: retry queue nếu cần đảm bảo delivery
            log.error("Failed to send verify email to {}: {}", event.getEmail(), e.getMessage());
        }
    }
}