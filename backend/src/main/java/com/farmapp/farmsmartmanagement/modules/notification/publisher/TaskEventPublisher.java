package com.farmapp.farmsmartmanagement.modules.notification.publisher;

import com.farmapp.farmsmartmanagement.config.rabbitmq.RabbitMQConfig;
import com.farmapp.farmsmartmanagement.modules.notification.event.TaskNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Gọi khi task được tạo mới.
     * recipients = tất cả member trong farm hoặc người được assign.
     */
    public void publishTaskCreated(UUID taskId, String taskTitle, UUID farmId,
                                   UUID actorId, String actorName,
                                   List<UUID> recipientIds) {
        TaskNotificationEvent event = TaskNotificationEvent.builder()
                .eventType(RabbitMQConfig.TASK_CREATED_KEY)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .farmId(farmId)
                .actorId(actorId)
                .actorName(actorName)
                .recipientIds(recipientIds)
                .occurredAt(Instant.now())
                .build();

        publish(RabbitMQConfig.TASK_CREATED_KEY, event);
    }

    /**
     * Gọi khi task được gán cho người dùng.
     */
    public void publishTaskAssigned(UUID taskId, String taskTitle, UUID farmId,
                                    UUID actorId, String actorName,
                                    UUID assigneeId, String assigneeName) {
        TaskNotificationEvent event = TaskNotificationEvent.builder()
                .eventType(RabbitMQConfig.TASK_ASSIGNED_KEY)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .farmId(farmId)
                .actorId(actorId)
                .actorName(actorName)
                .assigneeName(assigneeName)
                .recipientIds(List.of(assigneeId))  // Chỉ notify người được assign
                .occurredAt(Instant.now())
                .build();

        publish(RabbitMQConfig.TASK_ASSIGNED_KEY, event);
    }

    /**
     * Gọi khi task bị cập nhật (status, deadline...).
     */
    public void publishTaskUpdated(UUID taskId, String taskTitle, UUID farmId,
                                   UUID actorId, String actorName,
                                   List<UUID> recipientIds) {
        TaskNotificationEvent event = TaskNotificationEvent.builder()
                .eventType(RabbitMQConfig.TASK_UPDATED_KEY)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .farmId(farmId)
                .actorId(actorId)
                .actorName(actorName)
                .recipientIds(recipientIds)
                .occurredAt(Instant.now())
                .build();

        publish(RabbitMQConfig.TASK_UPDATED_KEY, event);
    }

    /**
     * Gọi từ scheduler khi task quá hạn.
     */
    public void publishTaskOverdue(UUID taskId, String taskTitle, UUID farmId,
                                   String dueDateStr, List<UUID> recipientIds) {
        TaskNotificationEvent event = TaskNotificationEvent.builder()
                .eventType(RabbitMQConfig.TASK_OVERDUE_KEY)
                .taskId(taskId)
                .taskTitle(taskTitle)
                .farmId(farmId)
                .dueDateStr(dueDateStr)
                .recipientIds(recipientIds)
                .occurredAt(Instant.now())
                .build();

        publish(RabbitMQConfig.TASK_OVERDUE_KEY, event);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private void publish(String routingKey, TaskNotificationEvent event) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.FARM_EXCHANGE, routingKey, event);
            log.info("[MQ] Published event={} taskId={} recipients={}",
                    routingKey, event.getTaskId(), event.getRecipientIds());
        } catch (Exception ex) {
            // Log lỗi nhưng không throw — tránh ảnh hưởng main flow
            log.error("[MQ] Failed to publish event={} taskId={}: {}",
                    routingKey, event.getTaskId(), ex.getMessage());
        }
    }
}