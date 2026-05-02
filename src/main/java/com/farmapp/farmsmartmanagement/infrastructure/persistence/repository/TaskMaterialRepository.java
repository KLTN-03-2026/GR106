package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TaskMaterialRepository extends JpaRepository<TaskMaterialEntity, UUID> {
    boolean existsByTask_IdAndWarehouseItem_Id(UUID id, UUID id1);

    List<TaskMaterialEntity> findAllByTask_Id(UUID taskId);

    void deleteByIdAndTask_Id(UUID taskMaterialId, UUID taskId);

    // TaskMaterialRepository
    @Query("""
    SELECT
        tm.warehouseItem.id,
        SUM(tm.plannedQty) - COALESCE(SUM(wlm.usedQty), 0)
    FROM TaskMaterialEntity tm
    LEFT JOIN WorkLogMaterialEntity wlm
        ON wlm.warehouseItem.id = tm.warehouseItem.id
       AND wlm.workLog.task.id  = tm.task.id
    WHERE tm.warehouseItem.id IN :itemIds
    GROUP BY tm.warehouseItem.id
    """)
    List<Object[]> sumRemainingQtyGroupByWarehouseItem(@Param("itemIds") List<UUID> itemIds);

    @Query("""
    SELECT
        SUM(tm.plannedQty) - COALESCE(SUM(wlm.usedQty), 0)
    FROM TaskMaterialEntity tm
    LEFT JOIN WorkLogMaterialEntity wlm
        ON wlm.warehouseItem.id = tm.warehouseItem.id
       AND wlm.workLog.task.id  = tm.task.id
    WHERE tm.warehouseItem.id = :itemId
    """)
    BigDecimal sumRemainingQtyByWarehouseItemId(@Param("itemId") UUID itemId);

    boolean existsByWarehouseItemId(UUID warehouseItemId);

}
