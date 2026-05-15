package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


// WarehouseItemRepository.java
public interface WarehouseItemRepository extends JpaRepository<WarehouseItemEntity, UUID> {




    boolean existsByNameAndWarehouse_Id(String name, UUID warehouseId);

    boolean existsBySupplierId(UUID supplierId);

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

    @EntityGraph(attributePaths = {"warehouse", "sku", "supplier", "unit", "createdBy"})
    List<WarehouseItemEntity> findAllByWarehouse_Id(UUID warehouseId);

    @EntityGraph(attributePaths = {"warehouse", "sku", "supplier", "unit", "createdBy"})
    Optional<WarehouseItemEntity> findByIdAndFarm_Id(UUID id, UUID farmId);

    @Query(value = """
        WITH hover AS (
            SELECT
                COALESCE(SUM(tm.planned_qty), 0)
                    - COALESCE(SUM(wlm.used_qty), 0) AS hover_qty
            FROM task_materials tm
            JOIN tasks t
                ON t.id = tm.task_id
                AND t.farm_id = :farmId
            LEFT JOIN work_logs wl
                ON wl.task_id = t.id
            LEFT JOIN work_log_materials wlm
                ON wlm.work_log_id = wl.id
                AND wlm.warehouse_item_id = :warehouseItemId
            WHERE tm.warehouse_item_id = :warehouseItemId
        ),
        stock AS (
            SELECT COALESCE(SUM(ws.qty_on_hand), 0) AS qty_on_hand
            FROM warehouse_stock ws
            WHERE ws.warehouse_item_id = :warehouseItemId
              AND ws.farm_id = :farmId
        )
        SELECT (stock.qty_on_hand - hover.hover_qty) >= :neededQty
        FROM stock, hover
    """, nativeQuery = true)
    boolean isStockSufficientForPlanning(
            @Param("warehouseItemId") UUID warehouseItemId,
            @Param("farmId") UUID farmId,
            @Param("neededQty") BigDecimal neededQty
    );

    boolean existsByIdAndWarehouse_Id(@NotNull(message = "Vui lòng chọn vị trí trong kho") UUID toLocationId, UUID warehouseId);

    @EntityGraph(attributePaths = {"warehouse","sku", "supplier", "unit", "createdBy"})
    List<WarehouseItemEntity> findAllByFarm_Id(UUID farmId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT w
        FROM WarehouseItemEntity w
        WHERE w.id = :id
        AND w.farm.id = :farmId
    """)
    Optional<WarehouseItemEntity> findByIdAndFarm_IdForUpdate(@Param("id") UUID id, @Param("farmId") UUID farmId);

    boolean existsByNameAndWarehouse_IdAndIdNot(String name, UUID warehouseId, UUID excludeId);

    boolean existsBySku_SkuAndWarehouse_IdAndIdNot(String sku, UUID warehouseId, UUID excludeId);

    Optional<WarehouseItemEntity> findByIdAndWarehouse_IdAndFarm_Id(UUID warehouseItemId, UUID warehouseId, UUID farmId);

    @EntityGraph(attributePaths = {"warehouse","sku", "supplier", "unit", "createdBy"})
    List<WarehouseItemEntity> findAllByWarehouse_IdAndFarm_Id(UUID warehouseId, UUID farmId);
}
