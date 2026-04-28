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

// SupplierService.java
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
        UUID farmId = securityUtils.getCurrentFarmId();
        return supplierMapper.toSupplierResponses(
                supplierRepository.findAllByFarm_Id(farmId)
        );
    }

    @Transactional
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (supplierRepository.existsBySupplierCodeAndFarm_Id(request.getSupplierCode(), farmId))
            throw new AppException(ErrorCode.SUPPLIER_ALREADY_EXISTS);

        SupplierEntity supplier = new SupplierEntity();
        supplier.setSupplierCode(request.getSupplierCode());
        supplier.setName(request.getName());
        supplier.setFarm(farmRepository.getReferenceById(farmId));
        supplier.setCreatedAt(Instant.now());

        return supplierMapper.toSupplierResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(UUID supplierId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        SupplierEntity supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        if (!supplier.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (warehouseItemRepository.existsBySupplierId(supplierId))
            throw new AppException(ErrorCode.SUPPLIER_IS_USING);

        supplierRepository.delete(supplier);
    }

//    @Transactional
//    public SupplierResponse updateSupplier(UUID supplierId, UpdateSupplierRequest request) {
//        UUID farmId = securityUtils.getCurrentFarmId();
//
//        SupplierEntity supplier = supplierRepository.findById(supplierId)
//                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
//
//        if (!supplier.getFarm().getId().equals(farmId))
//            throw new AppException(ErrorCode.FORBIDDEN);
//
//        if (request.getName() != null)
//            supplier.setName(request.getName());
//
//        return supplierMapper.toSupplierResponse(supplierRepository.save(supplier));
//    }
}
