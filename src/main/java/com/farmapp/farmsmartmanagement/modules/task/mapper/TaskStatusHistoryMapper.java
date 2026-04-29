package com.farmapp.farmsmartmanagement.modules.task.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusHistoryEntity;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface TaskStatusHistoryMapper {
    TaskStatusHistoryResponse toResponse(TaskStatusHistoryEntity entity);

    List<TaskStatusHistoryResponse> toResponses(List<TaskStatusHistoryEntity> entities);
}
