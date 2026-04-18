package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.TaskMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
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

    @Transactional
    public TaskResponse createTask(UUID planId, UUID planStageId, CreateTaskRequest request){

        if(!planStageRepository.existsByPlanId(planId))
            throw new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND);

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
    public TaskResponse updateTask(UUID planId, UUID planStageId, UUID taskId, UpdateTaskRequest request){

        if(!planStageRepository.existsByPlanId(planId))
            throw new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND);

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
        if (request.getStartDate().isBefore(planStage.getStartDate()) ||
                request.getEndDate().isAfter(planStage.getEndDate())) {
            throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);
        }

        TaskEntity updateTask = taskRepository.findById(taskId)
                .orElseThrow(()-> new AppException(ErrorCode.TASK_NOT_FOUND));

        if(request.getPlotId() != null){
            PlotEntity plot = planPlotRepository
                    .findPlotByPlanIdAndPlotId(planId, request.getPlotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
            updateTask.setPlot(plot);
        }


        // nếu không có thay đổi thì return luôn
        if (!hasChanges(updateTask, request)) {
            return taskMapper.toResponse(updateTask);
        }

        taskMapper.updateEntityFromRequest(request, updateTask);

        return taskMapper.toResponse(updateTask);
    }
    @Transactional
    public List<TaskResponse> findAllByPlanStageId(UUID planStageId) {
        return taskMapper.toResponses(
                taskRepository.findAllByPlanStageId(planStageId)
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