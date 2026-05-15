package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusHistoryEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusHistoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlanStageStatusHistoryMapper {

    PlanStageStatusHistoryResponse toResponse(PlanStageStatusHistoryEntity entity);

    List<PlanStageStatusHistoryResponse> toResponses(List<PlanStageStatusHistoryEntity> entities);
}
