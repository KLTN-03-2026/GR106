package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusTransitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface PlanStageStatusTransitionRepository extends JpaRepository<PlanStageStatusTransitionEntity, UUID> {
    List<PlanStageStatusTransitionEntity> findAllByFarm_Id(UUID farmId);
    boolean existsByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID fromStatusId, UUID toStatusId);
    @Query("""
        SELECT COUNT(t) > 0
        FROM PlanStageStatusTransitionEntity t
        WHERE t.fromStatus.id = :fromId
          AND t.toStatus.id   = :toId
          AND (t.farm IS NULL OR t.farm.id = :farmId)
    """)
    boolean existsByFromAndToStatus(
            @Param("farmId") UUID farmId,
            @Param("fromId") UUID fromId,
            @Param("toId")   UUID toId);
    Optional<PlanStageStatusTransitionEntity> findByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID id, UUID id1);
}