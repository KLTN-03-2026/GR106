package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusTransitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskStatusTransitionRepository extends JpaRepository<TaskStatusTransitionEntity, UUID> {
    List<TaskStatusTransitionEntity> findAllByFarm_Id(UUID farmId);
    boolean existsByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID fromStatusId, UUID toStatusId);
}