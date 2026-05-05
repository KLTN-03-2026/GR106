package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WarehouseRepository extends JpaRepository<WarehouseEntity, UUID> {
    boolean existsByNameAndFarm_Id(String name, UUID farmId);

    void deleteByIdAndFarm_Id(UUID warehouseId, UUID farmId);

    Optional<WarehouseEntity> findByIdAndFarm_Id(UUID warehouseId, UUID farmId);

    @Query("""
            SELECT w FROM WarehouseEntity w
            WHERE w.deletedAt IS NULL
            """)
    List<WarehouseEntity> findAllByDeletedAtIsNull();
}
