package com.farmapp.farmsmartmanagement.modules.worklog.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmployeeWageConfigEntity;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.EmployeeWageConfigResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeWageConfigMapper {

    @Mapping(target = "farmId",       source = "farm.id")
    @Mapping(target = "userId",       source = "user.id")
    @Mapping(target = "userFullName", source = "user.fullName")
    EmployeeWageConfigResponse toResponse(EmployeeWageConfigEntity entity);

    List<EmployeeWageConfigResponse> toResponses(List<EmployeeWageConfigEntity> entities);
}