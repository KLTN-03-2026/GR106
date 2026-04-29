package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.TaskRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.TaskStatusHistoryRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.TaskStatusRepository;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusTransitionResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskStatusHistoryMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    public List<TaskStatusResponse> findAllTaskStatus(){
        return taskStatusHistoryMapper.toResponses(taskStatusRepository.findAll());
    }

    public List<TaskStatusHistoryResponse> findAllTaskStatusHistory(UUID planId, UUID stageId, UUID taskId){

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanIdAndStatusIsNotTerminal(taskId,planId,stageId)
                .orElseThrow(()->new AppException(ErrorCode.TASK_NOT_FOUND));

        return taskStatusHistoryMapper.toResponses(taskStatusHistoryRepository.findAllByTask_Id(task.getId()));
    }

    public List<TaskStatusTransitionResponse> findAllTaskStatusTransition(UUID planId, UUID stageId, UUID taskId){

    }

}
