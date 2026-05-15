package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskDependencyResponse {
    TaskResponse task;
    List<TaskResponse> dependsOnTasks;
}