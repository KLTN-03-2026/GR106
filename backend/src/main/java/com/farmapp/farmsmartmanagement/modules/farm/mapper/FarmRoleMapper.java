package com.farmapp.farmsmartmanagement.modules.farm.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmRoleEntity;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FarmRoleMapper {
    FarmRoleResponse toResponse(FarmRoleEntity farmRoleEntity);

    List<FarmRoleResponse> toResponses(List<FarmRoleEntity> farmRoleEntity);

}
