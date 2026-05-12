package com.farmapp.farmsmartmanagement.modules.notification.consumer;

import com.farmapp.farmsmartmanagement.config.rabbitmq.RabbitMQConfig;
import com.farmapp.farmsmartmanagement.domain.enums.NotificationType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.NotificationEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.NotificationRepository;
import com.farmapp.farmsmartmanagement.modules.notification.dto.response.NotificationResponse;
import com.farmapp.farmsmartmanagement.modules.notification.event.TaskNotificationEvent;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate  messagingTemplate;

    @RabbitListener(
            queues = RabbitMQConfig.NOTIFICATION_QUEUE,
            containerFactory = "rabbitListenerContainerFactory"
    )
    @Transactional
    public void handleTaskEvent(
            TaskNotificationEvent event,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {

        log.info("[Consumer] Received event={} taskId={}", event.getEventType(), event.getTaskId());

        try {
            // Mỗi recipient nhận 1 notification riêng
            for (UUID recipientId : event.getRecipientIds()) {
                // 1. Build notification content theo loại event
                String title = buildTitle(event);
                String body  = buildBody(event);
                NotificationType type = resolveType(event.getEventType());

                // 2. Lưu vào DB
                NotificationEntity saved = notificationRepository.save(
                        NotificationEntity.builder()
                                .recipientId(recipientId)
                                .type(type)
                                .title(title)
                                .body(body)
                                .referenceId(event.getTaskId())
                                .referenceType("TASK")
                                .isRead(false)
                                .build()
                );

                // 3. Push realtime qua WebSocket tới đúng user
                NotificationResponse payload = toResponse(saved);
                messagingTemplate.convertAndSendToUser(
                        recipientId.toString(),         // userId làm destination
                        "/queue/notifications",         // client subscribe: /user/{userId}/queue/notifications
                        payload
                );

                log.info("[Consumer] Saved & pushed notif id={} → userId={}", saved.getId(), recipientId);
            }

            // ACK sau khi xử lý thành công
            channel.basicAck(deliveryTag, false);

        } catch (Exception ex) {
            log.error("[Consumer] Error processing event={}: {}", event.getEventType(), ex.getMessage(), ex);
            // NACK — đưa vào DLQ, không requeue
            channel.basicNack(deliveryTag, false, false);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String buildTitle(TaskNotificationEvent e) {
        return switch (e.getEventType()) {
            case "task.assigned" -> "Bạn được giao công việc mới";
            case "task.created"  -> "Công việc mới được tạo";
            case "task.updated"  -> "Công việc vừa được cập nhật";
            case "task.overdue"  -> "⚠️ Công việc quá hạn";
            default              -> "Thông báo từ hệ thống";
        };
    }

    private String buildBody(TaskNotificationEvent e) {
        return switch (e.getEventType()) {
            case "task.assigned" -> String.format(
                    "%s đã giao cho bạn công việc \"%s\"", e.getActorName(), e.getTaskTitle());
            case "task.created"  -> String.format(
                    "%s vừa tạo công việc \"%s\"", e.getActorName(), e.getTaskTitle());
            case "task.updated"  -> String.format(
                    "Công việc \"%s\" vừa được cập nhật bởi %s", e.getTaskTitle(), e.getActorName());
            case "task.overdue"  -> String.format(
                    "Công việc \"%s\" đã quá hạn vào %s", e.getTaskTitle(), e.getDueDateStr());
            default              -> e.getTaskTitle();
        };
    }

    private NotificationType resolveType(String eventType) {
        return switch (eventType) {
            case "task.assigned" -> NotificationType.TASK_ASSIGNED;
            case "task.created"  -> NotificationType.TASK_CREATED;
            case "task.updated"  -> NotificationType.TASK_UPDATED;
            case "task.overdue"  -> NotificationType.TASK_OVERDUE;
            default              -> NotificationType.SYSTEM;
        };
    }

    private NotificationResponse toResponse(NotificationEntity e) {
        return NotificationResponse.builder()
                .id(e.getId())
                .type(e.getType())
                .title(e.getTitle())
                .body(e.getBody())
                .referenceId(e.getReferenceId())
                .referenceType(e.getReferenceType())
                .isRead(e.getIsRead())
                .createdAt(e.getCreatedAt())
                .build();
    }
}