package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.response.PageableResponse;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.validation.PlanStageValidator;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskTimeRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMapper;
import com.farmapp.farmsmartmanagement.modules.task.validation.TaskValidator;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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

    TaskDependencyRepository taskDependencyRepository;
    TaskSkipDayRepository taskSkipDayRepository;
    TaskStatusHistoryRepository taskStatusHistoryRepository;
    TaskMaterialRepository taskMaterialRepository;
    TaskAssigneeRepository taskAssigneeRepository;
    DiseaseReportRepository diseaseReportRepository;
    WorkSessionRepository workSessionRepository;
    FarmConfigRepository farmConfigRepository;

    TaskValidator taskValidator;
    PlanStageValidator planStageValidator;

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

        if(planStage.getStatus().getIsTerminal() || (planStage.getActualEndDate() != null
                && LocalDate.now().isAfter(planStage.getActualEndDate())))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        // check ownership
        if (!planStage.getPlan().getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // validate date
        LocalDate stageStartDate = planStage.getActualStartDate() != null?
                planStage.getActualStartDate() : planStage.getStartDate();

        if (request.getStartDate().isBefore(stageStartDate) ||
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

        PlanStageEntity planStage = planStageValidator.validateAndGetStage(planStageId,planId,farmId);

        if (request.getStartDate() != null && request.getEndDate() != null) {
            LocalDate startDate = planStage.getActualStartDate() != null
                    ? planStage.getActualStartDate()
                    : planStage.getStartDate();
            LocalDate endDate = planStage.getActualEndDate() != null
                    ? planStage.getActualEndDate()
                    : planStage.getEndDate();

            if (request.getStartDate().isBefore(startDate) ||
                    request.getEndDate().isAfter(endDate)) {
                throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);
            }
        }

        TaskEntity task = taskValidator.validateAndGetTask(taskId, planStage.getId(), planId, farmId);

        // Lớp 1: Bảo vệ lost update giữa các session — client phải gửi đúng version hiện tại
        if (!task.getVersion().equals(request.getVersion())) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }

        if (request.getPlotId() != null) {
            PlotEntity plot = planPlotRepository
                    .findPlotByPlanIdAndPlotId(planId, request.getPlotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
            task.setPlot(plot);
        }

        if (request.getName() != null)
            task.setName(request.getName());

        if (request.getDescription() != null){
            task.setDescription(request.getDescription());
        }

        if((request.getStartDate() != null ||  request.getEndDate() != null) && workSessionRepository
                .existsOutsideRangeByTask_IdForCheckUpdateTaskTime(
                        task.getId(),
                        request.getStartDate(),
                        request.getEndDate())
        )
        {
            throw new AppException(ErrorCode.TASK_HAVE_SESSION_OUT_SIDE_NEW_DATE_RANGE);
        }

        if (request.getStartDate() != null)
            task.setStartDate(request.getStartDate());

        if (request.getEndDate() != null)
            task.setEndDate(request.getEndDate());

        // Lớp 2: Bảo vệ race condition giữa các request đồng thời
        return taskMapper.toResponse(taskRepository.saveAndFlush(task));

    }


    @Transactional
    public TaskResponse updateTaskTime(
            UUID planId, UUID planStageId, UUID taskId, UpdateTaskTimeRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();

        // Stage còn active
        PlanStageEntity planStage = planStageValidator
                .validateAndGetStage(planStageId, planId, farmId);

        // Task còn active + lock
        TaskEntity task = taskValidator
                .validateAndGetTaskForUpdate(taskId, planStageId, planId, farmId);

        // Optimistic lock
        if (!Objects.equals(task.getVersion(), request.getVersion()))
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);

        // Validate date với stage — dùng actual nếu có
        if (request.getStartDate() != null || request.getEndDate() != null) {
            LocalDate newStart = request.getStartDate() != null
                    ? request.getStartDate() : task.getStartDate();
            LocalDate newEnd = request.getEndDate() != null
                    ? request.getEndDate() : task.getEndDate();

            LocalDate stageStart = planStage.getActualStartDate() != null
                    ? planStage.getActualStartDate() : planStage.getStartDate();
            LocalDate stageEnd = planStage.getActualEndDate() != null
                    ? planStage.getActualEndDate() : planStage.getEndDate();

            if (newStart != null && newStart.isBefore(stageStart))
                throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);

            if (newEnd != null && stageEnd != null && newEnd.isAfter(stageEnd))
                throw new AppException(ErrorCode.TASK_OUT_OF_TIME_PLAN_STAGE);

            if (newStart != null && newEnd != null && newStart.isAfter(newEnd))
                throw new AppException(ErrorCode.TASK_START_DATE_AFTER_END_DATE);
        }

        if(workSessionRepository
                .existsOutsideRangeByTask_IdForCheckUpdateTaskTime(
                        task.getId(),
                        request.getStartDate(),
                        request.getEndDate())) {
            throw new AppException(ErrorCode.TASK_HAVE_SESSION_OUT_SIDE_NEW_DATE_RANGE);
        }
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());

        try {
            return taskMapper.toResponse(taskRepository.saveAndFlush(task));
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

    @Transactional(readOnly = true)
    public List<TaskResponse> findAssignedTasksForToday(UUID userId){
        UUID farmId = securityUtils.getCurrentFarmId();
        return taskMapper.toResponses(
                taskRepository.findAssignedTasksForToday(userId, farmId)
        );
    }

    @Transactional(readOnly = true)
    public PageableResponse<TaskResponse> findAssignedTasks(UUID userId, Pageable pageable) {
        Page<TaskResponse> page = taskRepository
                .findAssignedTaskByUser_Id(userId, pageable)
                .map(taskMapper::toResponse);

        return PageableResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageableResponse<TaskResponse> findAssignedTasksByDate(UUID userId,LocalDate date, Pageable pageable) {
        UUID farmId = securityUtils.getCurrentFarmId();
        Page<TaskResponse> page = taskRepository
                .findAssignedTaskByUser_IdAndDate(userId,farmId, date, pageable)
                .map(taskMapper::toResponse);

        return PageableResponse.of(page);
    }

    // Only hard delete
    @Transactional
    public void deleteTask(UUID taskId) {
        TaskEntity task = taskRepository
                .findByIdForUpdateAndStatusIsNotTerminal(taskId) // lấy lock
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        validateTaskTerminalOrExpired(task);
        validateTaskReferences(taskId);

        cleanupTask(taskId);

        // kiểm tra lại để tránh race condition
        validateTaskReferences(taskId);

        taskRepository.delete(task);
    }

    private void cleanupTask(UUID taskId) {
        taskMaterialRepository.deleteByTask_Id(taskId);

        taskAssigneeRepository.deleteByTask_Id(taskId);

        taskDependencyRepository.deleteByTask_IdOrDependsOnTask_Id(taskId, taskId);

        taskSkipDayRepository.deleteByTask_Id(taskId);

        taskStatusHistoryRepository.deleteByTask_Id(taskId);

        diseaseReportRepository.deleteByTask_Id(taskId);

    }

    private void validateTaskTerminalOrExpired(TaskEntity task) {
        boolean isTerminal = task.getStatus().getIsTerminal();
        boolean isExpired = LocalDate.now().isAfter(task.getEndDate());

        if (isTerminal || isExpired) {
            throw new AppException(ErrorCode.TASK_IS_TERMINAL_OR_EXPIRED_CANNOT_DELETE);
        }
    }

    private void validateTaskReferences(UUID taskId) {
        if (taskRepository.existsAnyReference(taskId)) {
            throw new AppException(ErrorCode.TASK_HAS_REFERENCE);
        }
    }

    private boolean hasChanges(TaskEntity entity, UpdateTaskRequest request) {
        return !(Objects.equals(entity.getName(), request.getName())
                && Objects.equals(entity.getDescription(), request.getDescription())
                && Objects.equals(entity.getStartDate(), request.getStartDate())
                && Objects.equals(entity.getEndDate(), request.getEndDate()));
    }



}