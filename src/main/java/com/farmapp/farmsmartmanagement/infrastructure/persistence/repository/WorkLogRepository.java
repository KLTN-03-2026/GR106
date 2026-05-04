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

    boolean existsByTask_IdAndEmployee_IdAndWorkDateAndShift_Id(UUID taskId, UUID employeeId, @NotNull(message = "Ngày làm việc không được để trống") LocalDate workDate, UUID shiftId);

    // WorkLogRepository
    List<WorkLogEntity> findAllByTask_IdOrderByWorkDateDesc(UUID taskId);

    List<WorkLogEntity> findAllByEmployee_IdAndFarm_IdAndWorkDateBetweenOrderByWorkDateDesc(
            UUID employeeId, UUID farmId, LocalDate from, LocalDate to);

    List<WorkLogEntity> findAllByFarm_IdAndWorkDateBetweenOrderByWorkDateDesc(
            UUID farmId, LocalDate from, LocalDate to);

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
}
