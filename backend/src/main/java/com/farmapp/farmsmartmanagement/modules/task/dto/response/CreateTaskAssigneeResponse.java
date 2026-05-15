package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CreateTaskAssigneeResponse {
    UUID id;

    UserResponse user;

    TaskSummaryResponse task;

    UserResponse assigneeBy;
    Instant assigneeAt;
}
