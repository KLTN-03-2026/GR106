package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
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
            COALESCE(t.actualStartDate, t.startDate) < :stageStartDate
            OR COALESCE(t.actualEndDate, t.endDate) > :stageEndDate
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

//    @Query("""
//        SELECT t FROM TaskEntity t
//        WHERE t.id = :taskId
//          AND t.planStage.id = :stageId
//          AND t.planStage.plan.id = :planId
//          AND t.status.isTerminal = false
//          AND t.farm.id = :farmId
//    """)
//    Optional<TaskEntity> findByIdAndStageIdAndPlanIdAndFarmIdAndStatusIsNotTerminal(
//            @Param("taskId") UUID taskId,
//            @Param("stageId") UUID stageId,
//            @Param("planId") UUID planId,
//            @Param("farmId") UUID farmId
//    );

    @Query("""
        SELECT t FROM TaskEntity t
        JOIN FETCH t.planStage ps
        JOIN FETCH ps.status
        JOIN FETCH ps.plan p
        JOIN FETCH t.status
        WHERE t.id      = :taskId
          AND ps.id     = :stageId
          AND p.id      = :planId
          AND t.farm.id = :farmId
          AND t.status.isTerminal           = false
          AND ps.status.isTerminal          = false
          AND p.status NOT IN ('COMPLETED', 'CANCELLED')
          AND p.deletedAt  IS NULL
          AND t.deletedAt  IS NULL
    """)
    Optional<TaskEntity> findByIdAndStageIdAndPlanIdAndFarmIdAndStatusIsNotTerminal(
            @Param("taskId")  UUID taskId,
            @Param("stageId") UUID stageId,
            @Param("planId")  UUID planId,
            @Param("farmId")  UUID farmId);


    @Query("""
        SELECT t FROM TaskEntity t
        JOIN FETCH t.planStage ps
        JOIN FETCH ps.status
        JOIN FETCH ps.plan p
        JOIN FETCH t.status
        WHERE t.id                   = :taskId
          AND t.farm.id              = :farmId
          AND ps.id                  = :stageId
          AND p.id                   = :planId
          AND t.status.isTerminal    = false
          AND ps.status.isTerminal   = false
          AND p.status NOT IN ('COMPLETED', 'CANCELLED')
          AND p.deletedAt            IS NULL
          AND t.deletedAt            IS NULL
        """)
    Optional<TaskEntity> findByIdForUpdateAndStatusIsNotTerminal(
            @Param("taskId")  UUID taskId,
            @Param("stageId") UUID stageId,
            @Param("planId")  UUID planId,
            @Param("farmId")  UUID farmId);

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

    @Query("""
        SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
        FROM TaskEntity t
        WHERE t.status.isTerminal = false
          AND t.planStage.status.isTerminal = false
          AND t.id = :taskId
    """)
    boolean existsByIdAndStatusIsNotTerminalAndPlanStageStatusIsNotTerminal(UUID taskId);

    @Query(value = """
            SELECT CASE
            WHEN EXISTS (SELECT 1 FROM work_logs wl WHERE wl.task_id = :taskId)
                OR EXISTS (SELECT 1 FROM warehouse_transactions wt WHERE wt.ref_task_id = :taskId)
                OR EXISTS (SELECT 1 FROM disease_reports dr WHERE dr.task_id = :taskId)
            THEN true
            ELSE false
            END
        """, nativeQuery = true)
    boolean existsAnyReference(UUID taskId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TaskEntity t WHERE t.id = :id")
    Optional<TaskEntity> findByIdForUpdateAndStatusIsNotTerminal(@Param("id") UUID id);


    List<TaskEntity> findAllByPlanStage_IdAndDeletedAtIsNull(UUID stageId);
    @Query("""
            SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
            FROM TaskEntity t
            WHERE t.planStage.plan.id = :planId
            AND t.id = :id
        """)
    boolean existsByPlot_IdAndPlan_Id(@Param("id") UUID id,@Param("planId") UUID planId);
}