package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.TaskMaterialResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {TaskMapper.class})
public interface TaskMaterialMapper {

    TaskMaterialResponse toResponse(TaskMaterialEntity entity);
}
