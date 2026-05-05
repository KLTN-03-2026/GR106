package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseStockEntity;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring",
        uses = {UserMapper.class, WarehouseMapper.class, UnitMapper.class, SupplierMapper.class, SkuMapper.class})
public interface WarehouseItemMapper {

    @Mapping(source = "supplier", target = "supplier")
    @Mapping(source = "unit", target = "unit")
    @Mapping(source = "sku", target = "sku")
    @Mapping(source = "createdBy", target = "createdBy")
    @Mapping(target = "stock", ignore = true)
    WarehouseItemResponse toResponse(WarehouseItemEntity entity);

    WarehouseItemSummaryResponse toSummaryResponse(WarehouseItemEntity entity);
    List<WarehouseItemSummaryResponse> toSummaryResponses(List<WarehouseItemEntity> entities);

    List<WarehouseItemResponse> toResponses(List<WarehouseItemEntity> entities);

}

