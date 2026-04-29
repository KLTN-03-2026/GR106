package com.farmapp.farmsmartmanagement.modules.task.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusTransitionEntity;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusTransitionResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskTransitionMapper {
    TaskStatusTransitionResponse toResponse(TaskStatusTransitionEntity entity);

    List<TaskStatusTransitionResponse> toResponse(List<TaskStatusTransitionEntity> entities);
}
