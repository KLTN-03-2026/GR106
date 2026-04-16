package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.TaskResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskMapper {


    @Mapping(target = "planStageId", source = "planStage.id")
    @Mapping(target = "farmId", source = "farm.id")
    @Mapping(target = "plotId", source = "plot.id", defaultExpression = "java(null)")
    @Mapping(target = "statusId", source = "status.id")
    @Mapping(target = "statusName", source = "status.name")
    @Mapping(target = "createdBy", source = "createdBy.id")
    TaskResponse toResponse(TaskEntity task);
}
