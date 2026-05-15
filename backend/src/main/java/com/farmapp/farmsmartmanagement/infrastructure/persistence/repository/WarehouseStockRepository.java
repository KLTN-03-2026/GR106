package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseStockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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
    List<Object[]> sumQtyByItemIdsAndFarmId(
            @Param("itemIds") List<UUID> itemIds,
            @Param("farmId") UUID farmId);     // ← thiếu @Param

    @Query("""
        SELECT COALESCE(ws.qtyOnHand, 0)
        FROM WarehouseStockEntity ws
        WHERE ws.warehouseItem.id = :warehouseItemId
          AND ws.location.id = :fromLocationId
        """)
    BigDecimal findQtyByWarehouseItemIdAndLocationId(
            @Param("warehouseItemId") UUID warehouseItemId,   // ← thiếu @Param
            @Param("fromLocationId") UUID fromLocationId);    // ← thiếu @Param

    boolean existsByLocation_IdAndFarm_Id(UUID warehouseLocationId, UUID farmId);

    // ─────────────────────────────────────────────────────
    // Thêm — lấy stock theo location cụ thể để hiển thị
    // cho employee biết còn bao nhiêu tại vị trí đó
    // ─────────────────────────────────────────────────────
    @Query("""
        SELECT ws
        FROM WarehouseStockEntity ws
        WHERE ws.warehouseItem.id = :itemId
          AND ws.farm.id = :farmId
          AND ws.qtyOnHand > 0
        ORDER BY ws.qtyOnHand DESC
        """)
    List<WarehouseStockEntity> findAvailableStockByItem(
            @Param("itemId") UUID itemId,
            @Param("farmId") UUID farmId);

    // Thêm vào WarehouseStockRepository:

    List<WarehouseStockEntity> findAllByWarehouseItem_IdAndFarm_IdAndQtyOnHandGreaterThan(
            UUID warehouseItemId,
            UUID farmId,
            BigDecimal qty
    );
}