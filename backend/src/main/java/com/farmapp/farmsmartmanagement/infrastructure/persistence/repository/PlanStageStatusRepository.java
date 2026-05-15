package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanStageStatusRepository extends JpaRepository<PlanStageStatusEntity, UUID> {
    List<PlanStageStatusEntity> findByIsInitialTrue(Pageable pageable);

    Optional<PlanStageStatusEntity> findByCode(String active);

    @Query("""
        SELECT pss
        FROM PlanStageEntity ps
        JOIN PlanStageStatusTransitionEntity psst
            ON ps.status.id = psst.fromStatus.id
           AND psst.farm.id = :farmId
        JOIN PlanStageStatusEntity pss
            ON pss.id = psst.toStatus.id
        WHERE ps.id = :planStageId
    """)
    List<PlanStageStatusEntity> findAllByPlanStage_IdAndFarm_IdAndStatusAvailable(@Param("planStageId") UUID planStageId,@Param("farmId") UUID farmId);
}
