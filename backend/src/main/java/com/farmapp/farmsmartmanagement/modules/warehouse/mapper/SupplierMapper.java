package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SupplierEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SupplierResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    @Mapping(source = "supplierCode", target = "code")
    SupplierResponse toSupplierResponse(SupplierEntity supplier);

    List<SupplierResponse> toSupplierResponses(List<SupplierEntity> supplier);
}
