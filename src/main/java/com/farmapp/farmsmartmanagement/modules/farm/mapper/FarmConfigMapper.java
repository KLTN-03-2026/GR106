package com.farmapp.farmsmartmanagement.modules.farm.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmConfigEntity;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmConfigResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FarmConfigMapper {
    FarmConfigResponse toResponse(FarmConfigEntity entity);
}

