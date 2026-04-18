package com.farmapp.farmsmartmanagement.modules.warehouse.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.UserRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseRepository;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.UpdateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseResponse;
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

    SecurityUtils securityUtils;


    public List<WarehouseResponse> findAllWarehouses() {
        return warehouseMapper.toResponses(
                warehouseRepository.findAll()
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
}
