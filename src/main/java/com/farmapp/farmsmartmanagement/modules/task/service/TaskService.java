package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskTimeRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMapper;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CurrentTimestamp;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Timer;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskService {

    TaskRepository taskRepository;
    TaskStatusRepository taskStatusRepository;
    PlanStageRepository planStageRepository;
    FarmRepository farmRepository;
    PlanPlotRepository planPlotRepository;

    UserRepository userRepository;

    TaskMapper taskMapper;
    SecurityUtils securityUtils;

    EntityManager entityManager;

    @Transactional
    public TaskResponse createTask(UUID planId, UUID planStageId, CreateTaskRequest request){

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // check farm
        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // check planStage
        PlanStageEntity planStage = planStageRepository
                .findByIdAndPlanId(planStageId,planId)
                .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN));

        if(planStage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_IS_TERMINAL);

        // check ownership
        if (!planStage.getPlan().getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.CROP_ALREADY_EXISTS);
        }

        // validate date
        if (request.getStartDate().isBefore(planStage.getStartDate()) ||
        request.getEndDate().isAfter(planStage.getEndDate())) {
            throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);
        }

        // initial status
        TaskStatusEntity status = taskStatusRepository.findByIsInitialTrue();
        if (status == null) {
            throw new AppException(ErrorCode.TASK_STATUS_INITIAL_NOT_FOUND);
        }

        PlotEntity plot = null;
        if(request.getPlotId() != null)
            plot = planPlotRepository
                    .findPlotByPlanIdAndPlotId(planId, request.getPlotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));

        // create task
        TaskEntity task = new TaskEntity();
        task.setPlanStage(planStage);
        task.setFarm(farm);
        task.setPlot(plot); // -> Sau này triển khai
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

    @Transactional
    public TaskResponse updateTask(UUID planId, UUID planStageId, UUID taskId, UpdateTaskRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();

        PlanStageEntity planStage = planStageRepository
                .findByIdAndPlanIdAndPlan_Farm_Id(planStageId, planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        if(planStage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_IS_TERMINAL);

        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getStartDate().isBefore(planStage.getStartDate()) ||
                    request.getEndDate().isAfter(planStage.getEndDate())) {
                throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);
            }
        }

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // Lớp 1: Bảo vệ lost update giữa các session — client phải gửi đúng version hiện tại
        if (!task.getVersion().equals(request.getVersion())) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }

        if (!task.getPlanStage().getId().equals(planStageId)) {
            throw new AppException(ErrorCode.TASK_NOT_FOUND);
        }

        if (request.getPlotId() != null) {
            PlotEntity plot = planPlotRepository
                    .findPlotByPlanIdAndPlotId(planId, request.getPlotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
            task.setPlot(plot);
        }

        if (request.getName() != null)
            task.setName(request.getName());

        if (request.getDescription() != null)
            task.setDescription(request.getDescription());

        if (request.getStartDate() != null)
            task.setStartDate(request.getStartDate());

        if (request.getEndDate() != null)
            task.setEndDate(request.getEndDate());

        // Lớp 2: Bảo vệ race condition giữa các request đồng thời
        return taskMapper.toResponse(taskRepository.saveAndFlush(task));

    }


    @Transactional
    public TaskResponse updateTaskTime(UUID planId, UUID planStageId, UUID taskId, UpdateTaskTimeRequest request){


        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // check farm
        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // check planStage
        PlanStageEntity planStage = planStageRepository
                .findByIdAndPlanId(planStageId,planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        if(planStage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_IS_TERMINAL);

        // check ownership
        if (!planStage.getPlan().getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND);
        }

        // validate date
        if (request.getStartDate().isBefore(planStage.getStartDate()) ||
                request.getEndDate().isAfter(planStage.getEndDate())) {
            throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);
        }

        TaskEntity updateTask = taskRepository.findById(taskId)
                .orElseThrow(()-> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!Objects.equals(updateTask.getVersion(), request.getVersion())) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }

        updateTask.setStartDate(request.getStartDate());
        updateTask.setEndDate(request.getEndDate());

        try {
            return taskMapper.toResponse(taskRepository.saveAndFlush(updateTask));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }
    }

    @Transactional
    public List<TaskResponse> findAllByPlanStageId(UUID planStageId) {
        return taskMapper.toResponses(
                taskRepository.findAllByPlanStageId(planStageId)
        );
    }

    @Transactional(readOnly = true)
    public TaskResponse findByIdAndPlanStageIdAndPlanId(UUID id, UUID planStageId, UUID planId) {
        return taskMapper.toResponse(
                taskRepository
                        .findByIdAndPlanStage_IdAndPlan_Id(id,planStageId,planId)
                        .orElseThrow(()->new AppException(ErrorCode.TASK_NOT_FOUND))
        );
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        taskRepository.deleteById(taskId);
    }



    private boolean hasChanges(TaskEntity entity, UpdateTaskRequest request) {
        return !(Objects.equals(entity.getName(), request.getName())
                && Objects.equals(entity.getDescription(), request.getDescription())
                && Objects.equals(entity.getStartDate(), request.getStartDate())
                && Objects.equals(entity.getEndDate(), request.getEndDate()));
    }



}