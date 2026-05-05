package com.farmapp.farmsmartmanagement.modules.warehouse.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseLocationEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseLocationRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseLocationResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.WarehouseLocationMapper;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.WarehouseMapper;
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
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class WarehouseService {

    FarmRepository farmRepository;

    UserRepository userRepository;

    WarehouseRepository warehouseRepository;

    WarehouseMapper warehouseMapper;

    WarehouseStockRepository warehouseStockRepository;

    WarehouseLocationRepository warehouseLocationRepository;
    WarehouseLocationMapper  warehouseLocationMapper;

    SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<WarehouseResponse> findAllWarehouses() {
        return warehouseMapper.toResponses(
                warehouseRepository.findAllByDeletedAtIsNull()
        );
    }

    @Transactional
    @PreAuthorize("hasAuthority('warehouse:manage')")
    public WarehouseResponse createWarehouse(UUID farmId, CreateWarehouseRequest request) {

        if (warehouseRepository.existsByNameAndFarm_Id(request.getName(), farmId))
            throw new AppException(ErrorCode.WAREHOUSE_ALREADY_EXISTS);

        FarmEntity farm = farmRepository.getReferenceById(farmId);

        UUID userId = securityUtils.getCurrentUserId();
        UserEntity createdBy = userRepository.getReferenceById(userId);

        WarehouseEntity entity = warehouseMapper.createEntityFromRequest(request);
        // Gán những field không có trong request
        entity.setFarm(farm);
        entity.setCreatedBy(createdBy);
        entity.setIsActive(true);

        warehouseRepository.save(entity);

        return warehouseMapper.toResponse(entity);
    }
//    public WarehouseResponse updateWarehouse(UUID warehouseId, UpdateWarehouseRequest request) {
//        WarehouseEntity warehouse = warehouseRepository.findById(warehouseId)
//                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));
//    }

    @Transactional
    @PreAuthorize("hasAuthority('warehouse:manage')")
    public void deleteWarehouse(UUID farmId, UUID warehouseId) {

        WarehouseEntity warehouse = warehouseRepository
                .findByIdAndFarm_Id(warehouseId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        // Soft delete
        warehouse.setDeletedAt(Instant.now());
    }

    // =============================== WAREHOUSE LOCATION ============================================
    //================================================================================================
    @Transactional(readOnly = true)
    public List<WarehouseLocationResponse> findAllWarehousesLocationsByWarehouseId(UUID warehouseId) {
        return warehouseLocationMapper.toResponses(warehouseLocationRepository.findByWarehouseIdAndNotDeleted(warehouseId));
    }

    @Transactional
    public WarehouseLocationResponse createWarehouseLocation(UUID warehouseId, CreateWarehouseLocationRequest request){
        FarmEntity farm = farmRepository.getReferenceById(securityUtils.getCurrentFarmId());

        WarehouseEntity warehouse = warehouseRepository
                .findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        if(warehouseLocationRepository.existsByCodeAndWarehouse_Id(request.getCode(), warehouse.getId()))
            throw new AppException(ErrorCode.WAREHOUSE_LOCATION_ALREADY_EXISTS);

        WarehouseLocationEntity warehouseLocation = new  WarehouseLocationEntity();
        warehouseLocation.setWarehouse(warehouse);
        warehouseLocation.setFarm(farm);
        warehouseLocation.setCode(request.getCode());
        warehouseLocation.setName(request.getName());
        warehouseLocation.setActive(true);
        warehouseLocation.setCreatedAt(Instant.now());

        return warehouseLocationMapper.toResponse(warehouseLocationRepository.save(warehouseLocation));
    }

    @Transactional
    public void deleteWarehouseLocation(UUID warehouseId, UUID warehouseLocationId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (warehouseStockRepository.existsByLocation_IdAndFarm_Id(warehouseLocationId, farmId)) {
            throw new AppException(ErrorCode.WAREHOUSE_LOCATION_IN_USE);
        }

        WarehouseLocationEntity location = warehouseLocationRepository
                .findByIdAndWarehouse_Id(warehouseLocationId, warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

        location.setDeletedAt(Instant.now());
        location.setActive(false);
        warehouseLocationRepository.save(location);
    }


}
