package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlanStageStatusMapper {
    PlanStageStatusResponse toResponse(PlanStageStatusEntity entity);
    List<PlanStageStatusResponse> toResponses(List<PlanStageStatusEntity> entities);
}
