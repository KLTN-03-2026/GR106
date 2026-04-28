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
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
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
    WarehouseLocationRepository warehouseLocationRepository;
    WarehouseStockRepository warehouseStockRepository;
    WarehouseTransactionRepository warehouseTransactionRepository;
    EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByFarm(UUID farmId) {
        return warehouseItemMapper.toResponses(warehouseItemRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByWarehouse(UUID warehouseId) {
        List<WarehouseItemEntity> items = warehouseItemRepository
                .findAllByWarehouse_Id(warehouseId);

        if (items.isEmpty()) return List.of();

        // 1 query lấy stock của tất cả items
        List<UUID> itemIds = items.stream().map(WarehouseItemEntity::getId).toList();
        Map<UUID, BigDecimal> stockMap = warehouseStockRepository
                .sumQtyByItemIds(itemIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (BigDecimal) row[1]
                ));

        return items.stream()
                .map(item -> {
                    WarehouseItemResponse response = warehouseItemMapper.toResponse(item);
                    response.setStock(stockMap.getOrDefault(item.getId(), BigDecimal.ZERO));
                    return response;
                })
                .toList();
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

        WarehouseLocationEntity location = warehouseLocationRepository
                .findByIdAndWarehouse_Id(request.getToLocationId(), warehouseId)
                .orElseThrow(()-> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

        WarehouseTransactionEntity transaction = new WarehouseTransactionEntity();
            transaction.setFarm(farm);
            transaction.setWarehouse(warehouse);
            transaction.setWarehouseItem(item);
            transaction.setFromLocation(null);
            transaction.setToLocation(location);
            transaction.setType(WarehouseTxnType.IMPORT_MANUAL);
            transaction.setQtyChange(request.getStock());
            transaction.setRefTransfer(null);
            transaction.setRefWorkLog(null);
            transaction.setRefTask(null);
            transaction.setRefHarvestId(null);
            transaction.setPerformedBy(user);
        transaction.setNotes("IMPORT WAREHOUSE ITEM MANUAL");



        warehouseTransactionRepository.save(transaction);

// Flush để trigger fn_update_stock chạy trên DB
        entityManager.flush();

        entityManager.refresh(item);

// Query stock sau khi trigger đã chạy
        BigDecimal totalStock = warehouseStockRepository
                .sumQtyByWarehouseItemId(item.getId());

        WarehouseItemResponse response = warehouseItemMapper.toResponse(item);
        response.setStock(totalStock);

        return response;
    }
}
