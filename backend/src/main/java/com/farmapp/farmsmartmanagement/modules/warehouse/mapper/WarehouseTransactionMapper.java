package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseTransactionEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseTransactionResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",uses = {WarehouseLocationMapper.class, WarehouseItemMapper.class, UnitMapper.class, WarehouseMapper.class})
public interface WarehouseTransactionMapper {
    WarehouseTransactionResponse toResponse(final WarehouseTransactionEntity entity);
}
