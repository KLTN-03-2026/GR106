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
public class TaskAssigneeResponse {
    UUID id;

    UserResponse user;

    UserResponse assigneeBy;
    Instant assigneeAt;

    UserResponse removedBy;
    Instant removedAt;
}
