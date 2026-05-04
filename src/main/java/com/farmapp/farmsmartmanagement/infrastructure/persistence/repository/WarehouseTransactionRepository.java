package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WarehouseTransactionRepository extends JpaRepository<WarehouseTransactionEntity, UUID> {
    void deleteAllByRefWorkLog_Id(UUID workLogId);
}
