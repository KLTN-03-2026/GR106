package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TaskMaterialRepository extends JpaRepository<TaskMaterialEntity, UUID> {
    boolean existsByTask_IdAndWarehouseItem_Id(UUID id, UUID id1);

    List<TaskMaterialEntity> findAllByTask_Id(UUID taskId);

    void deleteByIdAndTask_Id(UUID taskMaterialId, UUID taskId);

    @Query("""
        SELECT tm.warehouseItem.id, SUM(tm.plannedQty)
        FROM TaskMaterialEntity tm
        WHERE tm.warehouseItem.id IN :warehouseItemIds
        GROUP BY tm.warehouseItem.id
    """)
    List<Object[]> sumPlannedQtyGroupByWarehouseItem(List<UUID> warehouseItemIds);

}
