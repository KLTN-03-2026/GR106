package com.farmapp.farmsmartmanagement.modules.task.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTaskAssigneeRequest {
    @NotNull(message = "Vui lòng chọn người làm việc")
    UUID userId;
}
