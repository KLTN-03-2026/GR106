package com.farmapp.farmsmartmanagement.modules.task.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskSummaryResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {


    @Mapping(target = "planStageId", source = "planStage.id")
    @Mapping(target = "farmId", source = "farm.id")
    @Mapping(target = "farmName", source = "farm.name")
    @Mapping(target = "plotId", source = "plot.id", defaultExpression = "java(null)")
    @Mapping(target = "createdBy", source = "createdBy.id")
    TaskResponse toResponse(TaskEntity task);
    
    TaskSummaryResponse toSummaryResponse(TaskEntity task);

    List<TaskResponse> toResponses(List<TaskEntity> tasks);

    // map từ request sang entity đã load từ DB
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateTaskRequest request, @MappingTarget TaskEntity entity);
}
