package com.farmapp.farmsmartmanagement.modules.farm.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.CreateFarmRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.lang.annotation.Target;
import java.util.List;

@Mapper(componentModel = "spring")
public interface FarmMapper {

    @Mapping(source = "owner.id", target = "ownerId")
    FarmResponse toResponse(FarmEntity entity);

    List<FarmResponse> toResponseList(List<FarmEntity> entities);

//    default FarmEntity toEntity(CreateFarmRequest request) {
//
//    }
//
//    default FarmEntity toEntity(UpdateFarmRequest request){
//
//    }
}