package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkLogEntity;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogSummaryResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkLogRepository extends JpaRepository<WorkLogEntity, UUID> {

// Thêm vào WorkLogRepository

    // Thay existsByTask_IdAndEmployee_IdAndWorkDateAndShift_Id cũ
    boolean existsByTask_IdAndEmployee_IdAndWorkDateAndShift_IdAndDeletedAtIsNull(
            UUID taskId, UUID employeeId, LocalDate workDate, UUID shiftId);

    // Thay findAllByTask_IdOrderByWorkDateDesc cũ
    List<WorkLogEntity> findAllByTask_IdAndDeletedAtIsNullOrderByWorkDateDesc(UUID taskId);

    // Thay findAllByFarm_IdAndWorkDateBetweenOrderByWorkDateDesc cũ
    List<WorkLogEntity> findAllByFarm_IdAndWorkDateBetweenAndDeletedAtIsNullOrderByWorkDateDesc(
            UUID farmId, LocalDate from, LocalDate to);

    // Thay findAllByEmployee cũ
    List<WorkLogEntity> findAllByEmployee_IdAndFarm_IdAndWorkDateBetweenAndDeletedAtIsNullOrderByWorkDateDesc(
            UUID employeeId, UUID farmId, LocalDate from, LocalDate to);

    @Query("""
    SELECT wl FROM WorkLogEntity wl
    JOIN wl.task t
    JOIN t.planStage ps
    WHERE ps.plan.id = :planId
      AND wl.farm.id = :farmId
      AND wl.deletedAt IS NULL
      AND (CAST(:from AS date) IS NULL OR wl.workDate >= :from)
      AND (CAST(:to AS date) IS NULL OR wl.workDate <= :to)
    ORDER BY wl.workDate DESC
""")
    List<WorkLogEntity> findAllByPlanIdAndFarmId(
            @Param("planId") UUID planId,
            @Param("farmId") UUID farmId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
    SELECT w FROM WorkLogEntity w
    LEFT JOIN FETCH w.shift
    LEFT JOIN FETCH w.task
    LEFT JOIN FETCH w.employee
    WHERE w.id = :id
    """)
    Optional<WorkLogEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
    SELECT new com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogSummaryResponse(
        wl.employee.id,
        wl.employee.fullName,
        COUNT(wl.id),
        SUM(CASE WHEN wl.isOvertime = true THEN 1 ELSE 0 END),
        ROUND(SUM(
            ewc.dailyRate
            * COALESCE(ws.coefficient, 1.0)
            * CASE WHEN wl.isOvertime = true THEN ewc.otMultiplier ELSE 1.0 END
        ), 0)
    )
    FROM WorkLogEntity wl
    LEFT JOIN WorkShiftEntity ws ON ws.id = wl.shift.id
    JOIN EmployeeWageConfigEntity ewc
        ON ewc.farm.id = wl.farm.id
       AND ewc.user.id = wl.employee.id
       AND ewc.effectiveFrom <= wl.workDate
       AND (ewc.effectiveTo IS NULL OR ewc.effectiveTo >= wl.workDate)
    WHERE wl.farm.id = :farmId
      AND wl.workDate BETWEEN :from AND :to
    GROUP BY wl.employee.id, wl.employee.fullName
    ORDER BY wl.employee.fullName
    """)
    List<WorkLogSummaryResponse> summarizeByEmployee(
            @Param("farmId") UUID farmId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    boolean existsByTask_IdAndLockedAtIsNotNull(UUID id);

    List<WorkLogEntity> findAllByTask_IdAndLockedAtIsNullAndDeletedAtIsNull(UUID taskId);

    boolean existsByTask_Id(UUID taskId);
}
