package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UnitEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.UnitResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    UnitResponse toUnitResponse(UnitEntity unitEntity);
    List<UnitResponse> toUnitResponses(List<UnitEntity> unitEntities);

}
