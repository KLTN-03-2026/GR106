package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SupplierEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateSupplierRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SupplierResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.SupplierMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierService {

    SupplierRepository supplierRepository;
    SupplierMapper supplierMapper;
    FarmRepository farmRepository;
    SecurityUtils securityUtils;

    WarehouseItemRepository warehouseItemRepository;

    @Transactional(readOnly = true)
    public List<SupplierResponse> getSuppliers() {
        return supplierMapper.toSupplierResponses(supplierRepository.findAll());
    }

    @Transactional
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        FarmEntity farm = farmRepository.getReferenceById(farmId);

        if (supplierRepository.existsBySupplierCodeAndFarm_Id(request.getSupplierCode(), farmId)) {
            throw new AppException(ErrorCode.SUPPLIER_ALREADY_EXISTS);
        }

        SupplierEntity supplierEntity = new SupplierEntity();
        supplierEntity.setSupplierCode(request.getSupplierCode());
        supplierEntity.setName(request.getName());
        supplierEntity.setCreatedAt(Instant.now());
        supplierEntity.setFarm(farm);

        return supplierMapper.toSupplierResponse(supplierRepository.save(supplierEntity));
    }

    @Transactional
    public void deleteSupplier(String supplierCode) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if(warehouseItemRepository.existsBySupplierCodeAndFarm_Id(supplierCode,farmId))
            throw new AppException(ErrorCode.SUPPLIER_IS_USING);

        supplierRepository.deleteBySupplierCode(supplierCode);
    }
}
