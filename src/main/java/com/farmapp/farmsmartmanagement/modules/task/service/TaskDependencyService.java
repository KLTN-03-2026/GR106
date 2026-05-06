package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskDependencyEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.TaskDependencyRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.TaskRepository;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskDependencyRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.CreateTaskDependencyResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskDependencyResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskDependencyMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskDependencyService {
    TaskDependencyRepository taskDependencyRepository;
    TaskRepository taskRepository;
    TaskDependencyMapper taskDependencyMapper;
    TaskMapper taskMapper;
    SecurityUtils securityUtils;

    @Transactional
    public CreateTaskDependencyResponse createTaskDependency(
            UUID planId, UUID planStageId, UUID taskId, CreateTaskDependencyRequest request
    ) {
        UUID farmId = securityUtils.getCurrentFarmId();
        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanIdAndFarmIdAndStatusIsNotTerminal(taskId,planStageId,planId,farmId)
                .orElseThrow(()-> new AppException(ErrorCode.TASK_NOT_FOUND));

        if(task.getActualEndDate() != null && LocalDate.now().isAfter(task.getActualEndDate()))
            throw new AppException(ErrorCode.TASK_ALREADY_EXPIRED);

        if(task.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.TASK_ALREADY_TERMINAL);

        // 3. Kiểm tra plan stage chưa terminal
        PlanStageEntity planStage = task.getPlanStage();
        // 1. Stage đã terminal
        if (planStage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        // 2. Stage đã qua actualEndDate (đã kết thúc thực tế)
        if (planStage.getActualEndDate() != null
                && LocalDate.now().isAfter(planStage.getActualEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);
        // Không kiểm tra endDate vì thực tế có thể làm trễ hơn

        TaskEntity dependencyOnTask = taskRepository
                .findByIdAndStageIdAndPlanIdAndFarmIdAndStatusIsNotTerminal(request.getDependsOnTaskId(),planStageId,planId,farmId)
                .orElseThrow(()-> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (task.getId().equals(dependencyOnTask.getId())) {
            throw new AppException(ErrorCode.TASK_DEPENDENCY_SELF_NOT_ALLOWED);
        }

        if (taskDependencyRepository.existsCircularDependency(
                task.getId(), dependencyOnTask.getId()))
            throw new AppException(ErrorCode.TASK_DEPENDENCY_CIRCULAR_NOT_ALLOWED);


        if(taskDependencyRepository.existsByTask_IdAndDependsOnTask_Id(task.getId(),dependencyOnTask.getId()))
            throw new AppException(ErrorCode.TASK_DEPENDENCY_ALREADY_EXISTS);

        TaskDependencyEntity taskDependency =  new TaskDependencyEntity();
        taskDependency.setTask(task);
        taskDependency.setDependsOnTask(dependencyOnTask);
        taskDependency.setCreatedAt(Instant.now());

        return taskDependencyMapper.toResponse(taskDependencyRepository.save(taskDependency));
    }


    @Transactional(readOnly = true)
    public TaskDependencyResponse getAllTaskDependencyByTaskId(UUID taskId) {

        List<TaskDependencyEntity> taskDependencies = taskDependencyRepository
                .findAllByTask_Id(taskId);

        if (taskDependencies.isEmpty()) {
            return TaskDependencyResponse.builder()
                    .task(taskMapper.toResponse(taskRepository
                            .findById(taskId)
                            .orElseThrow(()-> new AppException(ErrorCode.TASK_NOT_FOUND))))
                    .dependsOnTasks(List.of())
                    .build();
        }

        return TaskDependencyResponse.builder()
                .task(taskMapper.toResponse(taskDependencies.get(0).getTask()))
                .dependsOnTasks(taskMapper.toResponses(
                        taskDependencies.stream()
                                .map(TaskDependencyEntity::getDependsOnTask)
                                .toList()
                ))
                .build();
    }

    @Transactional
    public void deleteTaskDependency(UUID taskId, UUID dependsOnTaskId) {
        if (!taskDependencyRepository.existsByTask_IdAndDependsOnTask_Id(taskId, dependsOnTaskId)) {
            throw new AppException(ErrorCode.TASK_DEPENDENCY_NOT_FOUND);
        }

        if(taskRepository.existsByIdAndStatusIsNotTerminalAndPlanStageStatusIsNotTerminal(taskId))
            throw new  AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        if(taskRepository.existsByIdAndStatusIsNotTerminalAndPlanStageStatusIsNotTerminal(dependsOnTaskId))
            throw new  AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        taskDependencyRepository.deleteByTask_IdAndDependsOnTask_Id(taskId, dependsOnTaskId);

    }
}
