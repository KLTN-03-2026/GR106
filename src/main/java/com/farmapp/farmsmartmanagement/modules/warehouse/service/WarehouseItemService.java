package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
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

// WarehouseItemService.java
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
    WarehouseItemMapper warehouseItemMapper;

    WarehouseTransactionRepository warehouseTransactionRepository;

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByFarm(UUID farmId) {
        return warehouseItemMapper.toResponses(warehouseItemRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByWarehouse(UUID warehouseId) {
        return warehouseItemMapper.toResponses(
                warehouseItemRepository.findAllByWarehouse_Id(warehouseId)
        );
    }

    @Transactional
    public WarehouseItemResponse createWarehouseItem(UUID warehouseId,
                                                     CreateWarehouseItemRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        UUID farmId = securityUtils.getCurrentFarmId();

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity user = userRepository.getReferenceById(userId);

        // Validate warehouse thuộc farm
        WarehouseEntity warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        if (!warehouse.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // Validate SKU không duplicate trong cùng warehouse
        if (warehouseItemRepository.existsBySkuAndWarehouse_Id(request.getSku(), warehouseId))
            throw new AppException(ErrorCode.SKU_IS_USING);

        // Validate name không duplicate trong cùng warehouse
        if (warehouseItemRepository.existsByNameAndWarehouse_Id(request.getName(), warehouseId))
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_ALREADY_EXISTS);

        // Validate SKU tồn tại và thuộc farm
        SkuEntity sku = skuRepository.findById(request.getSku())
                .orElseThrow(() -> new AppException(ErrorCode.SKU_NOT_FOUND));

        if (!sku.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // Validate unit
        UnitEntity unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        // Supplier optional
        SupplierEntity supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

            if (!supplier.getFarm().getId().equals(farmId))
                throw new AppException(ErrorCode.FORBIDDEN);
        }

        WarehouseItemEntity item = new WarehouseItemEntity();
            item.setWarehouse(warehouse);
            item.setFarm(farm);
            item.setCreatedBy(user);
            item.setName(request.getName());
            item.setSku(sku);
            item.setUnit(unit);
            item.setSupplier(supplier);
            item.setUnitPrice(request.getUnitPrice());
            item.setMinStockQty(request.getMinStockQty());
        item = warehouseItemRepository.save(item);

        WarehouseTransactionEntity transaction = new WarehouseTransactionEntity();
            transaction.setFarm(farm);
            transaction.setWarehouse(warehouse);
            transaction.setWarehouseItem(item);
            transaction.setFromLocation(null);
            transaction.setToLocation(null);
            transaction.setToWarehouse(warehouse);
            transaction.setType(WarehouseTxnType.IMPORT_MANUAL);
            transaction.setQtyChange(request.getStock());
            transaction.setRefTransfer(null);
            transaction.setRefWorkLog(null);
            transaction.setRefTask(null);
            transaction.setRefHarvestId(null);
            transaction.setPerformedBy(user);
        transaction.setNotes("IMPORT WAREHOUSE ITEM MANUAL");

        warehouseTransactionRepository.save(transaction);



        return warehouseItemMapper.toResponse(item);
    }
}
