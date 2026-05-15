package com.farmapp.farmsmartmanagement.modules.notification.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.NotificationRepository;
import com.farmapp.farmsmartmanagement.modules.notification.dto.response.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Page<NotificationResponse> getMyNotifications(UUID userId, int page, int size) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(e -> NotificationResponse.builder()
                        .id(e.getId())
                        .type(e.getType())
                        .title(e.getTitle())
                        .body(e.getBody())
                        .referenceId(e.getReferenceId())
                        .referenceType(e.getReferenceType())
                        .isRead(e.getIsRead())
                        .createdAt(e.getCreatedAt())
                        .build());
    }

    public long countUnread(UUID userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }
}