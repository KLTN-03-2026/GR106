package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseLocationEntity;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocationEntity, UUID> {
    boolean existsByCodeAndWarehouse_Id(String code, UUID warehouseId);
}
