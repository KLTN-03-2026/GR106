package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusTransitionResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusHistoryMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusTransitionMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

    public List<TaskStatusResponse> findAllTaskStatus(){
        return taskStatusMapper.toResponses(taskStatusRepository.findAll());
    }

    public List<TaskStatusHistoryResponse> findAllTaskStatusHistory(UUID planId, UUID stageId, UUID taskId){

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanIdAndStatusIsNotTerminal(taskId,stageId, planId)
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
    public TaskStatusHistoryResponse updateTaskStatus(UUID planId, UUID stageId, UUID taskId, UUID taskStatusId){
        UUID farmId = securityUtils.getCurrentFarmId();

        UserEntity changedBy = userRepository.getReferenceById(securityUtils.getCurrentUserId());

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanIdAndStatusIsNotTerminal(taskId,stageId,planId)
                .orElseThrow(()->new AppException(ErrorCode.TASK_NOT_FOUND));

        if(task.getPlanStage().getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_IS_TERMINAL);

        TaskStatusEntity currentStatus = task.getStatus();

        TaskStatusEntity toStatus = taskStatusRepository
                .findById(taskStatusId)
                .orElseThrow(()->new AppException(ErrorCode.TASK_STATUS_NOT_FOUND));

        TaskStatusTransitionEntity existStatusTransition = taskStatusTransitionRepository
                .findByFarm_IdAndFromStatus_IdAndToStatus_Id(farmId, currentStatus.getId(), toStatus.getId())
                .orElseThrow(()->new AppException(ErrorCode.TASK_STATUS_TRANSITION_NOT_FOUND));

        task.setStatus(toStatus);

        TaskStatusHistoryEntity taskStatusHistory = new TaskStatusHistoryEntity();
        taskStatusHistory.setTask(task);
        taskStatusHistory.setFromStatus(currentStatus);
        taskStatusHistory.setToStatus(toStatus);
        taskStatusHistory.setChangedBy(changedBy);
        taskStatusHistory.setChangedAt(Instant.now());

        return taskStatusHistoryMapper.toResponse(taskStatusHistoryRepository.save(taskStatusHistory));
    }

}
