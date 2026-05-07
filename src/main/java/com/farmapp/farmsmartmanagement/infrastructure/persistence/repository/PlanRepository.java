package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<PlanEntity, UUID> {

    List<PlanEntity> findByFarm_Id(UUID farmId);

    boolean existsByFarm_IdAndName(UUID id, String name);

    boolean existsByFarm_Id(UUID farmId);

    Optional<PlanEntity> findByIdAndFarm_Id(UUID planId, UUID farmId);

    @Query("""
            SELECT p FROM PlanEntity p
            WHERE p.id = :planId
            AND p.farm.id = :farmId
        """)
    Optional<PlanEntity> findByIdAndFarm_IdForUpdate(UUID planId, UUID farmId);


    boolean existsByIdAndFarm_Id(UUID planId, UUID farmId);

    @Query("""
    SELECT CASE WHEN COUNT(p) = 0 THEN true
        ELSE (
            :startDate <= MIN(COALESCE(p.actualStartDate, p.startDate))
            AND :endDate >= MAX(COALESCE(p.actualEndDate, p.endDate))
        )
    END
    FROM PlanStageEntity p
    WHERE p.plan.id = :planId
""")
    boolean isPlanCoverAllStages(
            @Param("planId") UUID planId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<PlanEntity> findByIdAndFarm_IdAndDeletedAtIsNull(UUID planId, UUID farmId);
}