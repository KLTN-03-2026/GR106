package com.farmapp.farmsmartmanagement.modules.task.validation;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateWorkLogRequest;

import java.util.UUID;

public interface TaskValidator {

    // Dùng cho: read, createDependency, createWorkLog, updateTaskInfo
    TaskEntity validateAndGetTask(
            UUID taskId, UUID planStageId, UUID planId, UUID farmId);

    // Dùng cho: updateStatus — cần lock tránh race condition
    TaskEntity validateAndGetTaskForUpdate(
            UUID taskId, UUID planStageId, UUID planId, UUID farmId);
}
