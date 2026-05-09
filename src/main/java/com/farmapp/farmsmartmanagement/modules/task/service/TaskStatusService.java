package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.validation.PlanStageValidator;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusTransitionResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusHistoryMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusTransitionMapper;
import com.farmapp.farmsmartmanagement.modules.task.validation.TaskValidator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskStatusService {
    TaskStatusHistoryRepository taskStatusHistoryRepository;
    TaskStatusHistoryMapper taskStatusHistoryMapper;

    TaskRepository taskRepository;

    TaskStatusRepository taskStatusRepository;
    TaskStatusMapper taskStatusMapper;

    TaskStatusTransitionMapper taskStatusTransitionMapper;
    TaskStatusTransitionRepository taskStatusTransitionRepository;

    UserRepository userRepository;

    SecurityUtils securityUtils;

    PlanStageValidator planStageValidator;
    TaskValidator taskValidator;

    public List<TaskStatusResponse> findAllTaskStatus(){
        return taskStatusMapper.toResponses(taskStatusRepository.findAll());
    }

    public List<TaskStatusHistoryResponse> findAllTaskStatusHistory(UUID planId, UUID stageId, UUID taskId){

        TaskEntity task = taskRepository
                .findByIdAndPlanStage_IdAndPlan_Id(taskId,stageId, planId)
                .orElseThrow(()->new AppException(ErrorCode.TASK_NOT_FOUND));

        return taskStatusHistoryMapper.toResponses(taskStatusHistoryRepository.findAllByTask_Id(task.getId()));
    }

    @Transactional(readOnly = true)
    public List<TaskStatusTransitionResponse> findAllTaskStatusTransitionByFarm(){
        log.info("In findAllTaskStatusTransitionByFarm{}", securityUtils.getCurrentFarmId());
        return taskStatusTransitionMapper
                .toResponses(
                        taskStatusTransitionRepository.findAllByFarm_Id(securityUtils.getCurrentFarmId())
                );
    }

    @Transactional(readOnly = true)
    public List<TaskStatusResponse> findTaskStatusAvailableByTaskAndFarm(UUID taskId){
        UUID farmId = securityUtils.getCurrentFarmId();
        return taskStatusMapper.toResponses(
                taskStatusRepository.findByTask_IdAndFarm_IdAndStatusAvailable(taskId,farmId)
        );
    }

    @Transactional
    public TaskStatusHistoryResponse updateTaskStatus(
            UUID planId, UUID stageId, UUID taskId, UUID taskStatusId) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UserEntity changedBy = userRepository.getReferenceById(securityUtils.getCurrentUserId());

        // 1. Lock row — tránh race condition
        TaskEntity task = taskValidator.validateAndGetTaskForUpdate(taskId,stageId,planId,farmId);

        // 3. Kiểm tra toStatus tồn tại
        TaskStatusEntity toStatus = taskStatusRepository
                .findById(taskStatusId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_STATUS_NOT_FOUND));

        //TODO: if toStatus isTerminal And WorkSession existsOpenSessionByTask_Id throw TASK_HAVE_SESSION

        TaskStatusEntity currentStatus = task.getStatus();
        // 5. Kiểm tra transition hợp lệ (kể cả global farm_id IS NULL)
        if (!taskStatusTransitionRepository
                .existsByFromAndToStatus(farmId, currentStatus.getId(), toStatus.getId()))
            throw new AppException(ErrorCode.TASK_STATUS_TRANSITION_NOT_FOUND);

        // 6. Set actualStartDate khi bắt đầu thực sự (initial → non-initial)
        if (currentStatus.getIsInitial() && !toStatus.getIsInitial()
                && task.getActualStartDate() == null) {
            task.setActualStartDate(LocalDate.now());
        }

        // 7. Set actualEndDate và progress = 100 khi terminal
        if (toStatus.getIsTerminal()) {
            if (task.getActualStartDate() == null)
                task.setActualStartDate(LocalDate.now());

            task.setActualEndDate(LocalDate.now());
            task.setCompletedAt(Instant.now());
            task.setProgressPercent(new BigDecimal("100"));
        }

        // 8. Update status
        task.setStatus(toStatus);

        // 9. Ghi lịch sử
        TaskStatusHistoryEntity history = new TaskStatusHistoryEntity();
        history.setTask(task);
        history.setFromStatus(currentStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(changedBy);
        history.setChangedAt(Instant.now());

        return taskStatusHistoryMapper.toResponse(
                taskStatusHistoryRepository.save(history));
    }

}
