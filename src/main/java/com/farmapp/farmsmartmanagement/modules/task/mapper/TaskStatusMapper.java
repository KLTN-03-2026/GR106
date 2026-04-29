package com.farmapp.farmsmartmanagement.modules.task.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusEntity;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskStatusMapper {

    TaskStatusResponse toResponse(TaskStatusEntity entity);
    List<TaskStatusResponse> toResponses(List<TaskStatusEntity> entities);
}
