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

    // ─────────────────────────────────────────────────────────────────────────
    // Public methods
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public TaskEntity validateAndGetTask(
            UUID taskId, UUID planStageId, UUID planId, UUID farmId) {

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanIdAndFarmIdAndStatusIsNotTerminal(
                        taskId, planStageId, planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        validateExpiredAndStage(task);
        return task;
    }

    @Override
    public TaskEntity validateAndGetTaskForUpdate(
            UUID taskId, UUID planStageId, UUID planId, UUID farmId) {

        TaskEntity task = taskRepository
                .findByIdForUpdateAndStatusIsNotTerminal(
                        taskId, planStageId, planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        validateExpiredAndStage(task);
        return task;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private — dùng chung, không tốn query vì đã JOIN FETCH
    // ─────────────────────────────────────────────────────────────────────────

    private void validateExpiredAndStage(TaskEntity task) {

        // Task đã kết thúc thực tế
        if (task.getActualEndDate() != null
                && LocalDate.now().isAfter(task.getActualEndDate()))
            throw new AppException(ErrorCode.TASK_ALREADY_EXPIRED);

        // Stage đã kết thúc thực tế
        if (task.getPlanStage().getActualEndDate() != null
                && LocalDate.now().isAfter(task.getPlanStage().getActualEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        // Stage đã terminal
        if (task.getPlanStage().getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);
    }
}