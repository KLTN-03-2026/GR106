package com.farmapp.farmsmartmanagement.modules.notification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskNotificationEvent {

    private String      eventType;          // "task.assigned", "task.created", ...
    private UUID        taskId;
    private String      taskTitle;
    private UUID        farmId;
    private UUID        actorId;            // Người thực hiện hành động
    private String      actorName;
    private List<UUID>  recipientIds;       // Danh sách người nhận
    private Instant     occurredAt;

    // Thông tin bổ sung tùy eventType
    private String      assigneeName;       // Cho TASK_ASSIGNED
    private String      dueDateStr;         // Cho TASK_OVERDUE
}