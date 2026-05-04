package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTaskDependencyResponse {
    TaskResponse task;
    TaskResponse dependsOnTask;
}
