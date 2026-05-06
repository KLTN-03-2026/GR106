package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusTransitionEntity;
import org.mapstruct.Mapper;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskStatusTransitionRepository extends JpaRepository<TaskStatusTransitionEntity, UUID> {
    @EntityGraph(attributePaths = {"farm", "fromStatus", "toStatus", "farmRole"})
    List<TaskStatusTransitionEntity> findAllByFarm_Id(UUID farmId);

    boolean existsByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID fromStatusId, UUID toStatusId);

    Optional<TaskStatusTransitionEntity> findByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID id, UUID id1);

    @Query("""
    SELECT COUNT(t) > 0
    FROM TaskStatusTransitionEntity t
    WHERE t.fromStatus.id = :fromId
      AND t.toStatus.id   = :toId
      AND (t.farm IS NULL OR t.farm.id = :farmId)
    """)
    boolean existsByFromAndToStatus(
            @Param("farmId") UUID farmId,
            @Param("fromId") UUID fromId,
            @Param("toId")   UUID toId);
}