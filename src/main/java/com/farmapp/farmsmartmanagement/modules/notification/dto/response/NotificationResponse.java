package com.farmapp.farmsmartmanagement.modules.notification.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class NotificationResponse {
    private UUID             id;
    private NotificationType type;
    private String           title;
    private String           body;
    private UUID             referenceId;
    private String           referenceType;
    private Boolean          isRead;
    private Instant          createdAt;
}