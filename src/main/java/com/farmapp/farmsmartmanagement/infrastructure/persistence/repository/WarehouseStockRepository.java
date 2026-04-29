package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseStockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStockEntity, UUID> {
    @Query("""
        SELECT COALESCE(SUM(ws.qtyOnHand), 0)
        FROM WarehouseStockEntity ws
        WHERE ws.warehouseItem.id = :itemId
    """)
    BigDecimal sumQtyByWarehouseItemId(@Param("itemId") UUID itemId);

    @Query("""
        SELECT ws.warehouseItem.id, COALESCE(SUM(ws.qtyOnHand), 0)
        FROM WarehouseStockEntity ws
        WHERE ws.warehouseItem.id IN :itemIds
        GROUP BY ws.warehouseItem.id
    """)
    List<Object[]> sumQtyByItemIds(@Param("itemIds") List<UUID> itemIds);

    @Query("""
        SELECT ws.warehouseItem.id, COALESCE(SUM(ws.qtyOnHand), 0)
        FROM WarehouseStockEntity ws
        WHERE ws.warehouseItem.id IN :itemIds
        AND ws.farm.id = :farmId
        GROUP BY ws.warehouseItem.id
    """)
    List<Object[]> sumQtyByItemIdsAndFarmId(List<UUID> itemIds, UUID farmId);
}
