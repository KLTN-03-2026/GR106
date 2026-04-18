package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.UpdateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    WarehouseResponse toResponse(WarehouseEntity entity);

    WarehouseEntity createEntityFromRequest(CreateWarehouseRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(WarehouseEntity entity, @MappingTarget UpdateWarehouseRequest response);
}
