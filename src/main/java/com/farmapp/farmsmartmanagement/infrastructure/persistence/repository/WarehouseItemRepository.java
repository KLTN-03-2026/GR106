package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;


public interface WarehouseItemRepository extends JpaRepository<WarehouseItemEntity, UUID> {

    @Query("""
        SELECT COUNT(wi) > 0
        FROM WarehouseItemEntity wi
        WHERE wi.supplierCode.supplierCode = :supplierCode
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
}
