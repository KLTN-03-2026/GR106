package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseLocationEntity;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocationEntity, UUID> {
    boolean existsByCodeAndWarehouse_Id(String code, UUID warehouseId);

    void deleteByIdAndWarehouse_Id(UUID Id,UUID warehouseLocationId);

    @Query("SELECT wl FROM WarehouseLocationEntity wl " +
            "WHERE wl.warehouse.id = :warehouseId AND wl.deletedAt IS NULL")
    List<WarehouseLocationEntity> findByWarehouseIdAndNotDeleted(UUID warehouseId);


    Optional<WarehouseLocationEntity> findByIdAndWarehouse_Id(@NotNull(message = "Vui lòng chọn vị trí trong kho") UUID toLocationId, UUID warehouseId);
}
