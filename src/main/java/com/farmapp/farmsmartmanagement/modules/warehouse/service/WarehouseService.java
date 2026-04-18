package com.farmapp.farmsmartmanagement.modules.warehouse.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseRepository;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.WarehouseMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class WarehouseService {

    WarehouseRepository warehouseRepository;

    WarehouseMapper warehouseMapper;

    @Transactional
    @PreAuthorize("hasAuthority('warehouse:manage')")
    public WarehouseResponse createWarehouse(UUID farmId, CreateWarehouseRequest request) {

        if(warehouseRepository.existsByNameAndFarm_Id(request.getName(), farmId))
            throw new AppException(ErrorCode.WAREHOUSE_ALREADY_EXISTS);

        WarehouseEntity entity = warehouseMapper.createEntityFromRequest(request);

        return new WarehouseResponse();
    }
}
