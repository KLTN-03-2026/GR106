package com.farmapp.farmsmartmanagement.modules.plan.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanEntity;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlanMapper {

    @Mapping(source = "createdBy.id", target = "createdById")
    @Mapping(source = "farm.id", target = "farmId")
    PlanResponse toResponse(PlanEntity plan);

    @Mapping(source = "createdBy.id", target = "createdById")
    List<PlanResponse> toResponses(List<PlanEntity> plans);
}
