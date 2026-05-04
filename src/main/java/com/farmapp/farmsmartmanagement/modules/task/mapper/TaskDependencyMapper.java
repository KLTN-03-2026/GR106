package com.farmapp.farmsmartmanagement.modules.task.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskDependencyEntity;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.CreateTaskDependencyResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskDependencyResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {TaskMapper.class})
public interface TaskDependencyMapper {

    CreateTaskDependencyResponse toResponse(TaskDependencyEntity entity);
}
