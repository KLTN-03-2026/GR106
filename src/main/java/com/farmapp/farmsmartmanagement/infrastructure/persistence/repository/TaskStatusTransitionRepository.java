package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusTransitionEntity;
import org.mapstruct.Mapper;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskStatusTransitionRepository extends JpaRepository<TaskStatusTransitionEntity, UUID> {
    @EntityGraph(attributePaths = {"farm", "fromStatus", "toStatus", "farmRole"})
    List<TaskStatusTransitionEntity> findAllByFarm_Id(UUID farmId);

    boolean existsByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID fromStatusId, UUID toStatusId);

    Optional<TaskStatusTransitionEntity> findByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID id, UUID id1);
}