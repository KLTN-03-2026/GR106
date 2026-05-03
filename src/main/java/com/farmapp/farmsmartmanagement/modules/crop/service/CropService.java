package com.farmapp.farmsmartmanagement.modules.crop.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropTypeEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.CropRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.CropTypeRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.UserRepository;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateCropTypeRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateSystemCropRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropResponse;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropTypeResponse;
import com.farmapp.farmsmartmanagement.modules.crop.mapper.CropMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CropService {
    CropRepository cropRepository;
    CropTypeRepository cropTypeRepository;
    UserRepository  userRepository;
    CropMapper cropMapper;
    RlsUtils rlsUtils;
    SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<CropTypeResponse> getAllCropTypes() {
        return cropTypeRepository.findAll()
                .stream()
                .map(cropMapper::toTypeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CropTypeResponse getCropTypeById(UUID id) {
        return cropMapper.toTypeResponse(
                cropTypeRepository
                        .findById(id)
                        .orElseThrow(()->new AppException(ErrorCode.CROP_TYPE_NOT_FOUND))
        );
    }

    @Transactional(readOnly = true)
    public List<CropResponse> getAllSystemCrops() {
        return rlsUtils.runAsAdmin(() -> cropMapper.toResponses(
                cropRepository.findAllByScope(CropScope.SYSTEM))
        );
    }

    @Transactional(readOnly = true)
    public CropResponse getSystemCropById(UUID cropId) {
        return rlsUtils.runAsAdmin(() -> cropMapper
                .toResponse(
                        cropRepository
                                .findByIdAndScope(cropId, CropScope.SYSTEM)
                ));
    }

    @Transactional(readOnly = true)
    public List<CropResponse> getAllFarmCrops(UUID farmId) {
        return rlsUtils.runAsAdmin(() -> cropMapper.toResponses(
                cropRepository.findAllByScopeAndFarm_Id(CropScope.FARM, farmId))
        );
    }

    @Transactional(readOnly = true)
    public CropResponse getFarmCropByIdAndFarmId(UUID cropId, UUID farmId) {
        return cropMapper.toResponse(
                cropRepository
                        .findByIdAndScopeAndFarm_Id(cropId, CropScope.FARM,farmId)
                        .orElseThrow(()->new AppException(ErrorCode.CROP_NOT_FOUND))
        );
    }


    // ==================== SYSTEM crop (admin) ====================


    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CropTypeResponse createCropType(CreateCropTypeRequest request){
        return rlsUtils.runAsAdmin(()->{

            if(cropTypeRepository.existsByName(request.getName()))
                throw new AppException(ErrorCode.CROP_ALREADY_EXISTS);

            CropTypeEntity cropTypeEntity = new CropTypeEntity();
            cropTypeEntity.setName(request.getName());
            cropTypeEntity.setDescription(request.getDescription());
            cropTypeEntity.setCreatedAt(Instant.now());

            return cropMapper.toTypeResponse(
                    cropTypeRepository.save(cropTypeEntity)
            );
        });
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CropResponse createSystemCrop(CreateSystemCropRequest request) {
        return rlsUtils.runAsAdmin(() ->{

            if(cropRepository.existsByNameAndScopeAndDeletedAtIsNull(request.getName(), CropScope.SYSTEM))
                throw new AppException(ErrorCode.CROP_ALREADY_EXISTS);

            CropTypeEntity cropTypeEntity = cropTypeRepository
                    .findById(request.getCropTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.CROP_TYPE_NOT_FOUND));

            UUID userId = securityUtils.getCurrentUserId();

            UserEntity createdBy = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            CropEntity cropEntity = cropMapper.toSystemEntity(request, cropTypeEntity, createdBy);

            return cropMapper.toResponse(cropRepository.save(cropEntity));
        });
    }


    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteCropType(UUID cropTypeId) {
        rlsUtils.runAsAdmin(()->{
            CropTypeEntity cropType = cropTypeRepository.findById(cropTypeId)
                    .orElseThrow(() -> new AppException(ErrorCode.CROP_TYPE_NOT_FOUND));

            if(cropRepository.existsByCropType(cropType))
                throw new AppException(ErrorCode.CROP_TYPE_IN_USE);

            cropTypeRepository.delete(cropType);
        });
    }


}
