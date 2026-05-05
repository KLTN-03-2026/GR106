package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseLocationEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseLocationResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseLocationSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WarehouseLocationMapper {
    @Mapping(source = "active", target = "isActive")
    WarehouseLocationResponse toResponse(WarehouseLocationEntity entity);

    WarehouseLocationSummaryResponse toSummaryResponse(WarehouseLocationEntity entity);
    List<WarehouseLocationSummaryResponse> toSummaryResponses(List<WarehouseLocationEntity> entities);

    List<WarehouseLocationResponse> toResponses(List<WarehouseLocationEntity> entities);
}
