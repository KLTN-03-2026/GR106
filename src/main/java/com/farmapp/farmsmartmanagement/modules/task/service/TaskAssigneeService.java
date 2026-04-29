package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskAssigneeEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskAssigneeRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.CreateTaskAssigneeResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskAssigneeResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMapper;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskAssigneeService {
    TaskRepository taskRepository;
    TaskStatusRepository taskStatusRepository;
    PlanStageRepository planStageRepository;
    FarmRepository farmRepository;
    PlanPlotRepository planPlotRepository;

    FarmMemberRepository farmMemberRepository;

    UserRepository userRepository;

    TaskMapper taskMapper;
    SecurityUtils securityUtils;

    TaskMaterialRepository taskMaterialRepository;
    TaskAssigneeRepository taskAssigneeRepository;

    UserMapper userMapper;

    @Transactional
    public CreateTaskAssigneeResponse createTaskAssignee(UUID planId, UUID stageId, UUID taskId, CreateTaskAssigneeRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        UserEntity assigneeBy = userRepository.getReferenceById(securityUtils.getCurrentUserId());

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanIdAndStatusIsNotTerminal(taskId, stageId, planId)
                .orElseThrow(()-> new AppException(ErrorCode.TASK_NOT_FOUND));

        UserEntity user = userRepository
                .findById(request.getUserId())
                .orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXISTED));

        if(taskAssigneeRepository.existsByTask_IdAndUser_Id(task.getId(), user.getId()))
            throw new AppException(ErrorCode.TASK_ASSIGNEE_ALREADY_USER);

        if(!farmMemberRepository.existsByFarm_IdAndUser_Id(farmId, user.getId()))
            throw new AppException(ErrorCode.FARM_MEMBER_NOT_FOUND);

        // Chỉ so sánh lớn hơn, không tính 'bằng'
        if (LocalDate.now().isAfter(task.getEndDate())) {
            throw new AppException(ErrorCode.TASK_IS_TERMINAL);
        }

        TaskAssigneeEntity taskAssigneeEntity = new TaskAssigneeEntity();
        taskAssigneeEntity.setTask(task);
        taskAssigneeEntity.setUser(user);
        taskAssigneeEntity.setAssignedBy(assigneeBy);
        taskAssigneeEntity.setAssignedAt(Instant.now());

        taskAssigneeRepository.save(taskAssigneeEntity);

        return CreateTaskAssigneeResponse.builder()
                .id(taskAssigneeEntity.getId())
                .user(userMapper.toUserResponse(user))
                .task(taskMapper.toSummaryResponse(task))
                .assigneeBy(userMapper.toUserResponse(assigneeBy))
                .assigneeAt(taskAssigneeEntity.getAssignedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TaskAssigneeResponse> findAllAssignees(UUID planId, UUID stageId, UUID taskId) {
        List<TaskAssigneeEntity> assigneeEntities = taskAssigneeRepository
                .findAllByPlan_IdAndStage_IdAndTask_Id(planId, stageId,taskId);

        return assigneeEntities.stream()
                .map(ta->
                        TaskAssigneeResponse.builder()
                                .id(ta.getId())
                                .user(userMapper.toUserResponse(ta.getUser()))
                                .assigneeBy(userMapper.toUserResponse(ta.getAssignedBy()))
                                .assigneeAt(ta.getAssignedAt())
                                .removedBy(userMapper.toUserResponse(ta.getRemovedBy()))
                                .removedAt(ta.getRemovedAt())
                                .build())
                .toList();
    }

}
