package com.farmapp.farmsmartmanagement.modules.task.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskAssigneeEntity;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskAssigneeResponse;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, TaskMapper.class, TaskMaterialMapper.class})
public interface TaskAssigneeMapper {
    TaskAssigneeResponse toResponse(TaskAssigneeEntity entity);
}
