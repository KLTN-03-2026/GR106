package com.farmapp.farmsmartmanagement.modules.worklog.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkLogEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkLogMaterialEntity;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMapper;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogDetailResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses =  {UserMapper.class, TaskMapper.class, FarmMapper.class})
public interface WorkLogMapper {
    WorkLogResponse toResponse(WorkLogEntity entity);

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "taskName", source = "task.name")
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "employeeName", source = "employee.fullName")
    @Mapping(target = "shiftName", source = "shift.name")
    @Mapping(target = "isOvertime", source = "overtime")
    @Mapping(target = "materials", source = "materials")
    WorkLogDetailResponse toDetailResponse(WorkLogEntity entity);

    // map vật tư sang DTO
    @Mapping(target = "warehouseItemId", source = "warehouseItem.id")
    @Mapping(target = "warehouseItemName", source = "warehouseItem.name")
    @Mapping(target = "unitCode", source = "warehouseItem.unit.code")
    WorkLogDetailResponse.WorkLogMaterialResponse toMaterialResponse(WorkLogMaterialEntity entity);
}
