package com.farmapp.farmsmartmanagement.modules.task.validation;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.TaskRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskValidatorImpl implements TaskValidator {

    TaskRepository taskRepository;

    @Override
    public TaskEntity validateTerminationAndExpiredAndGetTask(UUID taskId) {
        TaskEntity task = taskRepository
                .findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (task.getStatus().getIsTerminal()) {
            throw new AppException(ErrorCode.TASK_ALREADY_TERMINAL);
        }

        if (task.getActualEndDate() != null && LocalDate.now().isAfter(task.getActualEndDate())) {
            throw new AppException(ErrorCode.TASK_ALREADY_EXPIRED);
        }

        return task;
    }
}
