package com.farmapp.farmsmartmanagement.modules.worklog.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkShiftEntity;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkShiftResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkShiftMapper {

    @Mapping(target = "farmId", source = "farm.id")
    WorkShiftResponse toResponse(WorkShiftEntity entity);

    List<WorkShiftResponse> toResponses(List<WorkShiftEntity> entities);
}