package com.farmapp.farmsmartmanagement.modules.worklog.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkLogEntity;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmMapper;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMapper;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogDetailResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses =  {UserMapper.class, TaskMapper.class, FarmMapper.class})
public interface WorkLogMapper {
    WorkLogResponse toResponse(WorkLogEntity entity);

    WorkLogDetailResponse toDetailResponse(WorkLogEntity entity);
}
