package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseItemRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.WarehouseItemMapper;
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
public class WarehouseItemService {
    WarehouseRepository warehouseRepository;
    WarehouseItemRepository warehouseItemRepository;
    SupplierRepository supplierRepository;
    SkuRepository skuRepository;
    UnitRepository unitRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    SecurityUtils securityUtils;

    WarehouseItemMapper  warehouseItemMapper;


    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByFarm(UUID farmId) {
        return warehouseItemMapper.toResponses(warehouseItemRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByWarehouse(UUID warehouseId) {
        return warehouseItemMapper.toResponses(warehouseItemRepository.findAllByWarehouse_Id(warehouseId));
    }

    @Transactional
    public WarehouseItemResponse createWarehouseItem(UUID warehouseId, CreateWarehouseItemRequest request){
        UUID userId = securityUtils.getCurrentUserId();
        UUID farmId = securityUtils.getCurrentFarmId();

        UserEntity user = userRepository.getReferenceById(userId);
        FarmEntity farm = farmRepository.getReferenceById(farmId);

        if(warehouseItemRepository.existsBySkuAndWarehouse_Id(request.getSku(), warehouseId)){
            throw new AppException(ErrorCode.SKU_IS_USING);
        }

        WarehouseEntity warehouse = warehouseRepository
                .findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        UnitEntity unit = unitRepository
                .findById(request.getUnitId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        SupplierEntity supplier = null;
        if (request.getSupplierCode() != null && !request.getSupplierCode().isBlank()) {
            supplier = supplierRepository
                    .findById(request.getSupplierCode())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        }



        SkuEntity sku = skuRepository
                .findById(request.getSku())
                .orElseThrow(()-> new AppException(ErrorCode.SKU_NOT_FOUND));

        if(warehouseItemRepository.existsByNameAndWarehouse_Id(request.getName(),warehouseId))
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_ALREADY_EXISTS);

        WarehouseItemEntity warehouseItemEntity = new WarehouseItemEntity();
        warehouseItemEntity.setWarehouse(warehouse);
        warehouseItemEntity.setUnit(unit);
        warehouseItemEntity.setSku(sku);
        warehouseItemEntity.setCreatedBy(user);
        warehouseItemEntity.setFarm(farm);
        warehouseItemEntity.setCreatedAt(Instant.now());
        warehouseItemEntity.setName(request.getName());
        warehouseItemEntity.setSupplier(supplier);
        warehouseItemEntity.setUnitPrice(request.getUnitPrice());
        warehouseItemEntity.setMinStockQty(request.getMinStockQty());



        return warehouseItemMapper.toResponse(warehouseItemRepository.save(warehouseItemEntity));
    }
}
