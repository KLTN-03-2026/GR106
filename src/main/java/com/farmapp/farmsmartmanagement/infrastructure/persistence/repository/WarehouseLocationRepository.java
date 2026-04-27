package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseLocationEntity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocationEntity, UUID> {
    boolean existsByCodeAndWarehouse_Id(String code, UUID warehouseId);

    void deleteByIdAndWarehouse_Id(UUID Id,UUID warehouseLocationId);

    Optional<WarehouseLocationEntity> findByIdAndWarehouse_Id(@NotNull(message = "Vui lòng chọn vị trí trong kho") UUID toLocationId, UUID warehouseId);
}
