package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanStageRepository extends JpaRepository<PlanStageEntity, UUID> {

    boolean existsByPlanIdAndNameAndDeletedAtIsNull(UUID planId, String name);

    // Sử dụng khi tạo mới
    @Query("""
    SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
    FROM PlanStageEntity p
    WHERE p.plan.id = :planId
    AND p.deletedAt IS NULL
    AND :startDate <= COALESCE(p.actualEndDate, p.endDate)
    AND :endDate   >= COALESCE(p.actualStartDate, p.startDate)
""")
    boolean existsOverlapping(
            @Param("planId")    UUID planId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );

    // Sử dụng khi update
    @Query("""
    SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
    FROM PlanStageEntity p
    WHERE p.plan.id = :planId
    AND p.id        <> :stageId
    AND p.deletedAt IS NULL
    AND :startDate <= COALESCE(p.actualEndDate, p.endDate)
    AND :endDate   >= COALESCE(p.actualStartDate, p.startDate)
""")
    boolean existsOverlappingWithoutId(
            @Param("planId")    UUID planId,
            @Param("stageId")   UUID stageId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );



    @Query("""
        SELECT p FROM PlanStageEntity p
        WHERE p.plan.id = :planId
        AND p.endDate <= :startDate
        AND p.deletedAt IS NULL
        ORDER BY p.endDate DESC
    """)
    List<PlanStageEntity> findPreviousStage(UUID planId, LocalDate startDate, Pageable pageable);

    @Query("""
            SELECT pt FROM PlanStageEntity pt
            WHERE pt.plan.id = :planId
            AND pt.deletedAt IS NULL
            """)
    List<PlanStageEntity> findAllByPlanId(@Param("planId") UUID planId);

    boolean existsByIdAndPlan_Id(UUID planStageId, UUID planId);

    @Query("""
            SELECT pt FROM PlanStageEntity pt
            WHERE pt.id = :planStageId
            AND pt.plan.id = :planId
            AND pt.deletedAt IS NULL
        """)
    Optional<PlanStageEntity> findByIdAndPlanId(@Param("planStageId") UUID planStageId,@Param("planId") UUID planId);

    @Query("""
        SELECT pt FROM PlanStageEntity pt
        WHERE pt.id = :stageId
          AND pt.plan.id = :planId
          AND pt.status.isTerminal = false
          AND pt.deletedAt IS NULL
    """)
    Optional<PlanStageEntity> findByIdAndPlanIdAndStatusIsNotTerminal(UUID stageId, UUID planId);

    Optional<PlanStageEntity> findByIdAndPlanIdAndDeletedAtIsNull(UUID stageId, UUID planId);

    List<PlanStageEntity> findAllByPlanIdAndDeletedAtIsNullOrderByStartDateAsc(UUID planId);

    @Query("""
        SELECT CASE WHEN EXISTS (
            SELECT 1
            FROM PlanStageEntity p
            WHERE p.plan.id = :planId
              AND p.id <> :planStageId
              AND :date >= COALESCE(p.actualStartDate, p.startDate)
              AND :date <= COALESCE(p.actualEndDate, p.endDate)
              AND p.deletedAt IS NULL
        ) THEN true ELSE false END
    """)
    boolean existsByPlanIdAndDateBetweenStartAndEndWithoutId(
            @Param("planId") UUID planId,
            @Param("date") LocalDate date,
            @Param("planStageId") UUID planStageId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT ps FROM PlanStageEntity ps
    WHERE ps.id = :id
      AND ps.plan.id = :planId
      AND ps.plan.farm.id = :farmId
    """)
    Optional<PlanStageEntity> findByIdForUpdate(
            @Param("id") UUID id,
            @Param("planId") UUID planId,
            @Param("farmId") UUID farmId);
}