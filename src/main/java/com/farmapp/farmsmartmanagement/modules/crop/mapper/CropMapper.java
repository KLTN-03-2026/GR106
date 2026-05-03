package com.farmapp.farmsmartmanagement.modules.crop.mapper;

import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropTypeEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateFarmCropRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateSystemCropRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropResponse;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropTypeResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.CreateFarmRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CropMapper {

    @Mapping(source = "clonedFrom.id", target = "clonedFromId")
    CropResponse toResponse(CropEntity entity);

    @Mapping(source = "clonedFrom.id", target = "clonedFromId")
    List<CropResponse> toResponses(List<CropEntity> entity);


    CropTypeResponse toTypeResponse(CropTypeEntity entity);

    List<CropTypeResponse> toTypeResponses(List<CropTypeEntity> entity);


    // SYSTEM crop
    default CropEntity toSystemEntity(CreateSystemCropRequest request,
                                      CropTypeEntity cropType,
                                      UserEntity createdBy) {
        CropEntity crop = new CropEntity();
        crop.setName(request.getName());
        crop.setDescription(request.getDescription());
        crop.setImageUrl(request.getImageUrl());
        crop.setCropType(cropType);
        crop.setScope(CropScope.SYSTEM);
        crop.setFarm(null);           // SYSTEM không có farm
        crop.setClonedFrom(null);       // SYSTEM không clone từ đâu
        crop.setCreatedBy(createdBy);
        crop.setCreatedAt(Instant.now());
        return crop;
    }

    // FARM crop
    default CropEntity toFarmEntity(CreateFarmCropRequest request,
                                    CropTypeEntity cropType,
                                    CropEntity clonedFrom,
                                    FarmEntity farm,
                                    UserEntity createdBy) {
        CropEntity crop = new CropEntity();
        crop.setName(request.getName());
        crop.setDescription(request.getDescription());
        crop.setImageUrl(request.getImageUrl());
        crop.setCropType(cropType);
        crop.setScope(CropScope.FARM);
        crop.setFarm(farm);
        crop.setClonedFrom(clonedFrom); // null nếu tạo mới hoàn toàn
        crop.setCreatedBy(createdBy);
        crop.setCreatedAt(Instant.now());
        return crop;
    }
}
