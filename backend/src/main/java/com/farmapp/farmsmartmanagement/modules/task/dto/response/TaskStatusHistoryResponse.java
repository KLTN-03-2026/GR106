package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatusHistoryResponse {
    TaskStatusResponse fromStatus;
    TaskStatusResponse toStatus;
    UserResponse changedBy;
    Instant changedAt;

}
