package com.farmapp.farmsmartmanagement.modules.task.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTaskDependencyRequest {
    @NotNull(message = "Vui lòng chọn công việc được phụ thuộc")
    UUID dependsOnTaskId;
}
