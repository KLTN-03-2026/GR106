package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusTransitionEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusTransitionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlanStageStatusTransitionMapper {

    PlanStageStatusTransitionResponse toResponse(PlanStageStatusTransitionEntity entity);

    List<PlanStageStatusTransitionResponse> toResponses(List<PlanStageStatusTransitionEntity> entities);
}
