package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.TaskMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskService {

    TaskRepository taskRepository;
    TaskStatusRepository taskStatusRepository;
    PlanStageRepository planStageRepository;
    FarmRepository farmRepository;

    UserRepository userRepository;

    TaskMapper taskMapper;
    SecurityUtils securityUtils;

    @Transactional
    public TaskResponse createTask(UUID planStageId, CreateTaskRequest request){

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // check farm
        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // check planStage
        PlanStageEntity planStage = planStageRepository.findById(planStageId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        // check ownership
        if (!planStage.getPlan().getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND);
        }

        // validate date
        if (request.getStartDate() != null && request.getEndDate() != null &&
                request.getStartDate().isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        // initial status
        TaskStatusEntity status = taskStatusRepository.findByIsInitialTrue();
        if (status == null) {
            throw new AppException(ErrorCode.TASK_STATUS_INITIAL_NOT_FOUND);
        }

        // create task
        TaskEntity task = new TaskEntity();
        task.setPlanStage(planStage);
        task.setFarm(farm);
        task.setPlot(null); // -> Sau này triển khai
        task.setStatus(status);
        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        task.setProgressPercent(BigDecimal.ZERO);
        task.setCreatedBy(user);
        task.setCreatedAt(Instant.now());

        return taskMapper.toResponse(taskRepository.save(task));
    }
}