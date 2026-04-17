package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PlanStageRepository extends JpaRepository<PlanStageEntity, UUID> {

    List<PlanStageEntity> findByPlan_IdOrderByOrderIndexAsc(UUID planId);

    boolean existsByPlanIdAndName(UUID planId, String name);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM PlanStageEntity p
        WHERE p.plan.id = :planId
        AND (
            :startDate <= p.endDate
            AND :endDate >= p.startDate
        )
    """)
    boolean existsOverlapping(
            @Param("planId") UUID planId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    PlanStageEntity findByPlan_IdAndOrderIndex(UUID planId, int orderIndex);


    @Query("""
        SELECT p FROM PlanStageEntity p
        WHERE p.plan.id = :planId
        AND p.endDate <= :startDate
        ORDER BY p.endDate DESC
    """)
    List<PlanStageEntity> findPreviousStage(UUID planId, LocalDate startDate, Pageable pageable);

    List<PlanStageEntity> findAllByPlanId(UUID planId);

    boolean existsByPlanId(UUID planId);
}