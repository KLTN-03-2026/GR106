package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseTransactionEntity;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WarehouseTransactionRepository extends JpaRepository<WarehouseTransactionEntity, UUID> {
    void deleteAllByRefWorkLog_Id(UUID workLogId);

    Page<WarehouseTransactionEntity> findAllByWarehouse_IdAndFarm_Id(UUID warehouseId, UUID farmId, Pageable pageable);
    Page<WarehouseTransactionEntity> findAllByFarm_Id(UUID farmId, Pageable pageable);
    Page<WarehouseTransactionEntity> findAllByWarehouseItem_Id(UUID warehouseItemId, Pageable pageable);

}
