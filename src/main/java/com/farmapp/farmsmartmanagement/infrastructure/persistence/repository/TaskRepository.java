package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {

    List<TaskEntity> findByFarm_Id(UUID farmId);

    List<TaskEntity> findByPlanStage_Id(UUID planStageId);

    List<TaskEntity> findByPlot_Id(UUID plotId);

    List<TaskEntity> findAllByPlanStageId(UUID planStageId);

    void deleteByPlanStageId(UUID stageId);


    @Query("""
    SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
    FROM TaskEntity t
    WHERE t.planStage.id = :planStageId
    AND (
        t.startDate < :stageStartDate
        OR t.endDate > :stageEndDate
    )
""")
    boolean existsTaskOutsideStage(
            @Param("planStageId") UUID planStageId,
            @Param("stageStartDate") LocalDate stageStartDate,
            @Param("stageEndDate") LocalDate stageEndDate
    );

    @Query("""
        SELECT t FROM TaskEntity t
        WHERE t.id = :taskId
          AND t.planStage.id = :stageId
          AND t.planStage.plan.id = :planId
          AND t.status.isTerminal = false
    """)
    Optional<TaskEntity> findByIdAndStageIdAndPlanIdAndStatusIsNotTerminal(
            @Param("taskId") UUID taskId,
            @Param("stageId") UUID stageId,
            @Param("planId") UUID planId
    );

    @Query("""
        SELECT t FROM TaskEntity t
        WHERE t.id = :taskId
          AND t.planStage.id = :stageId
          AND t.planStage.plan.id = :planId
          AND t.status.isTerminal = false
          AND t.farm.id = :farmId
    """)
    Optional<TaskEntity> findByIdAndStageIdAndPlanIdAndFarmIdAndStatusIsNotTerminal(
            @Param("taskId") UUID taskId,
            @Param("stageId") UUID stageId,
            @Param("planId") UUID planId,
            @Param("farmId") UUID farmId
    );

    @Query("""
        SELECT t FROM TaskEntity t
        WHERE t.id = :id
          AND t.planStage.id = :planStageId
          AND t.planStage.plan.id = :planId
    """)
    Optional<TaskEntity> findByIdAndPlanStage_IdAndPlan_Id(@Param("id") UUID id,@Param("planStageId") UUID planStageId,@Param("planId") UUID planId);

    @Query("""
            SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
            FROM TaskEntity t
            WHERE t.id = :taskId
            AND t.status.isTerminal = FALSE
            """)
    boolean existsByIdAndStatusIsNotTerminal(UUID taskId);
}