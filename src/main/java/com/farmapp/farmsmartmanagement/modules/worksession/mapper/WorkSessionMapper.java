package com.farmapp.farmsmartmanagement.modules.worksession.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkSessionEntity;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.response.WorkSessionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkSessionMapper {

    @Mapping(target = "taskId",          source = "task.id")
    @Mapping(target = "taskName",        source = "task.name")
    @Mapping(target = "employeeId",      source = "employee.id")
    @Mapping(target = "employeeName",    source = "employee.fullName")
    @Mapping(target = "isOpen",          expression = "java(entity.isOpen())")
    @Mapping(target = "isForceClose",    expression = "java(entity.isForceClose())")
    @Mapping(target = "forceReason",     source = "forceActionLog.reason")
    @Mapping(target = "forceClosedAt",   source = "forceActionLog.performedAt")
    @Mapping(target = "forceClosedBy",   source = "forceActionLog.performedBy.fullName")
    @Mapping(target = "adjustedBy",      source = "adjustedBy.fullName")
    @Mapping(target = "workLogId",       source = "workLog.id")
    WorkSessionResponse toResponse(WorkSessionEntity entity);

    List<WorkSessionResponse> toResponses(List<WorkSessionEntity> entities);
}