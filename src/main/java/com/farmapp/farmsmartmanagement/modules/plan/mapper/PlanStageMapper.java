package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlanStageMapper {

    @Mapping(source = "plan.id", target = "planId")
    PlanStageResponse toResponse(PlanStageEntity planStageEntity);

    List<PlanStageResponse> toResponses(List<PlanStageEntity> planStageEntity);
}
