package com.farmapp.farmsmartmanagement.modules.task.validation;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateWorkLogRequest;

import java.util.UUID;

public interface TaskValidator {
    TaskEntity validateTerminationAndExpiredAndGetTask(UUID taskId);
}
