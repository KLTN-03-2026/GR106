package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskMaterialRepository extends JpaRepository<TaskMaterialEntity, UUID> {
    boolean existsByTask_IdAndWarehouseItem_Id(UUID id, UUID id1);

    Optional<TaskMaterialEntity> findByTask_IdAndWarehouseItem_Id(UUID id, UUID id1);
    List<TaskMaterialEntity> findAllByTask_Id(UUID taskId);

    void deleteByIdAndTask_Id(UUID taskMaterialId, UUID taskId);

    @Query(value = """
    SELECT
        tm.warehouse_item_id,
        COALESCE(SUM(tm.planned_qty), 0) - COALESCE(SUM((
            SELECT COALESCE(SUM(wlm2.used_qty), 0)
            FROM work_log_materials wlm2
            JOIN work_logs wl2 ON wl2.id = wlm2.work_log_id
            WHERE wlm2.warehouse_item_id = tm.warehouse_item_id
              AND wl2.task_id = tm.task_id
        )), 0)
    FROM task_materials tm
    WHERE tm.warehouse_item_id IN :itemIds
    GROUP BY tm.warehouse_item_id
    """, nativeQuery = true)
    List<Object[]> sumRemainingQtyGroupByWarehouseItem(@Param("itemIds") List<UUID> itemIds);


    @Query(value = """
    SELECT
        COALESCE(SUM(tm.planned_qty), 0) - COALESCE(SUM((
            SELECT COALESCE(SUM(wlm2.used_qty), 0)
            FROM work_log_materials wlm2
            JOIN work_logs wl2 ON wl2.id = wlm2.work_log_id
            WHERE wlm2.warehouse_item_id = tm.warehouse_item_id
              AND wl2.task_id = tm.task_id
        )), 0)
    FROM task_materials tm
    WHERE tm.warehouse_item_id = :itemId
    """, nativeQuery = true)
    BigDecimal sumRemainingQtyByWarehouseItemId(@Param("itemId") UUID itemId);

    boolean existsByWarehouseItemId(UUID warehouseItemId);

    void deleteByTask_Id(UUID taskId);
}
