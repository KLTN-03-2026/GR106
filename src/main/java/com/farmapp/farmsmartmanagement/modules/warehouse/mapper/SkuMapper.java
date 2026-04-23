package com.farmapp.farmsmartmanagement.modules.warehouse.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SkuEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SkuResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SkuMapper {
    SkuResponse toSkuResponse(SkuEntity skuEntity);
    List<SkuResponse> toSkuResponses(List<SkuEntity> skuEntity);
}
