package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface WarehouseItemRepository extends JpaRepository<WarehouseItemEntity, UUID> {

    @Query("""
        SELECT COUNT(wi) > 0
        FROM WarehouseItemEntity wi
        WHERE wi.supplier.supplierCode = :supplierCode
          AND wi.farm.id = :farmId
    """)
    boolean existsBySupplierCodeAndFarm_Id(String supplierCode, UUID farmId);

    @Query("""
        SELECT COUNT(wi) > 0
        FROM WarehouseItemEntity wi
        WHERE wi.sku.sku = :sku
          AND wi.farm.id = :farmId
    """)
    boolean existsBySkuAndFarm_Id(String sku, UUID farmId);

    @Query("""
        SELECT COUNT(wi) > 0
        FROM WarehouseItemEntity wi
        WHERE wi.sku.sku = :sku
          AND wi.warehouse.id = :warehouseId
    """)
    boolean existsBySkuAndWarehouse_Id(String sku, UUID warehouseId);

    boolean existsByNameAndWarehouse_Id(String name, UUID warehouseId);

    List<WarehouseItemEntity> findAllByWarehouse_Id(UUID warehouseId);

    Optional<WarehouseItemEntity> findByIdAndFarmId(UUID warehouseItemId, UUID id);
}
