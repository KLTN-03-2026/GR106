package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.UpdateWarehouseItemRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseItemRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.WarehouseItemMapper;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    TaskMaterialRepository taskMaterialRepository;

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByFarm(UUID farmId) {
        long start = System.currentTimeMillis();
        List<WarehouseItemEntity> items = warehouseItemRepository.findAllByFarm_Id(farmId);
        log.info("Query findAllByFarm_Id took {} ms", System.currentTimeMillis() - start);

        if (items.isEmpty()) return List.of();

        List<UUID> itemIds = items.stream().map(WarehouseItemEntity::getId).toList();

        // đo thời gian query stock
        start = System.currentTimeMillis();
        Map<UUID, BigDecimal> stockMap = warehouseStockRepository
                .sumQtyByItemIdsAndFarmId(itemIds, farmId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (BigDecimal) row[1]
                ));
        log.info("Query sumQtyByItemIdsAndFarmId took {} ms", System.currentTimeMillis() - start);

        // đo thời gian query reservedQty
        start = System.currentTimeMillis();
        Map<UUID, BigDecimal> reservedQtyMap = taskMaterialRepository
                .sumRemainingQtyGroupByWarehouseItem(itemIds)  // đổi tên method
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> {
                            BigDecimal val = (BigDecimal) row[1];
                            // Có thể âm nếu work log dùng nhiều hơn planned — clamp về 0
                            return val != null && val.compareTo(BigDecimal.ZERO) > 0
                                    ? val : BigDecimal.ZERO;
                        }
                ));
        log.info("Query sumPlannedQtyGroupByWarehouseItem took {} ms", System.currentTimeMillis() - start);

        // build response
        start = System.currentTimeMillis();
        List<WarehouseItemResponse> responses = items.stream()
                .map(item -> {
                    WarehouseItemResponse response = warehouseItemMapper.toResponse(item);
                    response.setStock(stockMap.getOrDefault(item.getId(), BigDecimal.ZERO));
                    response.setReservedQty(reservedQtyMap.getOrDefault(item.getId(), BigDecimal.ZERO));
                    return response;
                })
                .toList();
        log.info("Mapping responses took {} ms", System.currentTimeMillis() - start);

        return responses;
    }

    @Transactional(readOnly = true)
    public List<WarehouseItemResponse> getAllWarehouseItemByWarehouseAndFarm(UUID warehouseId,UUID farmId) {
        List<WarehouseItemEntity> items = warehouseItemRepository
                .findAllByWarehouse_IdAndFarm_Id(warehouseId, farmId);

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

        Map<UUID, BigDecimal> reservedQtyMap = taskMaterialRepository
                .sumRemainingQtyGroupByWarehouseItem(itemIds)  // đổi tên method
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> {
                            BigDecimal val = (BigDecimal) row[1];
                            // Có thể âm nếu work log dùng nhiều hơn planned — clamp về 0
                            return val != null && val.compareTo(BigDecimal.ZERO) > 0
                                    ? val : BigDecimal.ZERO;
                        }
                ));
        return items.stream()
                .map(item -> {
                    WarehouseItemResponse response = warehouseItemMapper.toResponse(item);
                    response.setStock(stockMap.getOrDefault(item.getId(), BigDecimal.ZERO));
                    response.setReservedQty(reservedQtyMap.getOrDefault(item.getId(), BigDecimal.ZERO));
                    return response;
                })
                .toList();
    }

    @Transactional
    public WarehouseItemResponse createWarehouseItem(UUID warehouseId, CreateWarehouseItemRequest request) {
        UUID userId = securityUtils.getCurrentUserId();
        UUID farmId = securityUtils.getCurrentFarmId();

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity user = userRepository.getReferenceById(userId);

        // Validate warehouse thuộc farm
        WarehouseEntity warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));
        if(request.getStock().equals(0))
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_MUST_HAVE_STOCK);

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

    @Transactional
    public WarehouseItemResponse updateWarehouseItem(UUID farmId, UUID warehouseId, UUID warehouseItemId, UpdateWarehouseItemRequest request) {

        WarehouseItemEntity item = warehouseItemRepository
                .findByIdAndWarehouse_IdAndFarm_Id(warehouseItemId,warehouseId,farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

        if(!Objects.equals(item.getVersion(), request.getVersion()))
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);

        // Kiểm tra item thuộc farm
//        if (!item.getFarm().getId().equals(farmId))
//            throw new AppException(ErrorCode.FORBIDDEN);

        // Kiểm tra đã bị xóa chưa
        if (item.getDeletedAt() != null)
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND);

        // Validate name không duplicate trong cùng warehouse (trừ chính nó)
        if (request.getName() != null
                && !request.getName().equals(item.getName())
                && warehouseItemRepository.existsByNameAndWarehouse_IdAndIdNot(
                request.getName(), item.getWarehouse().getId(), warehouseItemId))
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_ALREADY_EXISTS);

        // Validate SKU không duplicate trong cùng warehouse (trừ chính nó)
        if (request.getSku() != null
                && !request.getSku().equals(item.getSku().getSku())
                && warehouseItemRepository.existsBySku_SkuAndWarehouse_IdAndIdNot(
                request.getSku(), item.getWarehouse().getId(), warehouseItemId))
            throw new AppException(ErrorCode.SKU_IS_USING);

        // Update SKU nếu có thay đổi
        if (request.getSku() != null
                && !request.getSku().equals(item.getSku().getSku())) {
            SkuEntity sku = skuRepository.findById(request.getSku())
                    .orElseThrow(() -> new AppException(ErrorCode.SKU_NOT_FOUND));

            if (!sku.getFarm().getId().equals(farmId))
                throw new AppException(ErrorCode.FORBIDDEN);

            item.setSku(sku);
        }

        // Update unit nếu có thay đổi
        if (request.getUnitId() != null
                && !request.getUnitId().equals(item.getUnit().getId())) {
            UnitEntity unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

            item.setUnit(unit);
        }

        // Update supplier nếu có thay đổi
        if (request.getSupplierId() != null) {
            SupplierEntity supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

            if (!supplier.getFarm().getId().equals(farmId))
                throw new AppException(ErrorCode.FORBIDDEN);

            item.setSupplier(supplier);
        } else {
            // Nếu client gửi null có nghĩa là muốn xóa supplier
            item.setSupplier(null);
        }

        // Update các field đơn giản
        if (request.getName() != null)
            item.setName(request.getName());

        if (request.getUnitPrice() != null)
            item.setUnitPrice(request.getUnitPrice());

        if (request.getMinStockQty() != null)
            item.setMinStockQty(request.getMinStockQty());

        //Flush luôn để kiểm tra xem có dòng nào được update, tức version lúc update có hợp lệ
        warehouseItemRepository.saveAndFlush(item);


        WarehouseItemResponse response = warehouseItemMapper.toResponse(item);

        // Query stock hiện tại
        BigDecimal totalStock = warehouseStockRepository
                .sumQtyByWarehouseItemId(warehouseItemId);
        response.setStock(totalStock != null ? totalStock : BigDecimal.ZERO);

        BigDecimal reservedQty = taskMaterialRepository
                .sumRemainingQtyByWarehouseItemId(warehouseItemId);
        response.setReservedQty(reservedQty != null
                && reservedQty.compareTo(BigDecimal.ZERO) > 0
                ? reservedQty : BigDecimal.ZERO);

        return response;
    }

    @Transactional
    public void deleteWarehouseItemByIdAndFarm(UUID warehouseItemId, UUID farmId) {

        // Pessimistic lock — block row trong suốt transaction
        WarehouseItemEntity item = warehouseItemRepository
                .findByIdAndFarm_Id(warehouseItemId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

        deleteWarehouseItem(item);
    }

    @Transactional
    public void deleteWarehouseItemByIdAndWarehouseAndFarm(UUID warehouseItemId, UUID warehouseId, UUID farmId) {
        // Pessimistic lock — block row trong suốt transaction
        WarehouseItemEntity item = warehouseItemRepository
                .findByIdAndWarehouse_IdAndFarm_Id(warehouseItemId, warehouseId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

        deleteWarehouseItem(item);
    }

    private void deleteWarehouseItem(WarehouseItemEntity item){
        // Kiểm tra đã bị xóa chưa
        if (item.getDeletedAt() != null)
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND);

        // Kiểm tra còn tồn kho không
        BigDecimal currentStock = warehouseStockRepository
                .sumQtyByWarehouseItemId(item.getId());

        if (currentStock != null && currentStock.compareTo(BigDecimal.ZERO) > 0)
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_HAS_STOCK);

        // Kiểm tra đang được dùng trong task_materials không
        boolean usedInTask = taskMaterialRepository
                .existsByWarehouseItemId(item.getId());

        if (usedInTask)
            throw new AppException(ErrorCode.WAREHOUSE_ITEM_IN_USE);

        // Soft delete
        item.setDeletedAt(Instant.now());
    }

}
