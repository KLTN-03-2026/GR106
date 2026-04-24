package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskMaterialRepository extends JpaRepository<TaskMaterialEntity, UUID> {
    boolean existsByTask_IdAndWarehouseItem_Id(UUID id, UUID id1);
}
