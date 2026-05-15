package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmployeeWageConfigEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// EmployeeWageConfigRepository.java
public interface EmployeeWageConfigRepository
        extends JpaRepository<EmployeeWageConfigEntity, UUID> {

    List<EmployeeWageConfigEntity> findAllByFarm_IdAndUser_IdOrderByEffectiveFromDesc(
            UUID farmId, UUID userId);

    List<EmployeeWageConfigEntity> findAllByFarm_IdOrderByEffectiveFromDesc(UUID farmId);

    // Kiểm tra trùng (farm + user + effectiveFrom)
    boolean existsByFarm_IdAndUser_IdAndEffectiveFrom(
            UUID farmId, UUID userId, LocalDate effectiveFrom);

    // Lấy config hiện tại theo ngày làm việc
    @Query("""
        SELECT e FROM EmployeeWageConfigEntity e
        WHERE e.farm.id   = :farmId
          AND e.user.id   = :userId
          AND e.effectiveFrom <= :workDate
          AND (e.effectiveTo IS NULL OR e.effectiveTo >= :workDate)
        """)
    Optional<EmployeeWageConfigEntity> findActiveConfig(
            @Param("farmId")   UUID farmId,
            @Param("userId")   UUID userId,
            @Param("workDate") LocalDate workDate);

    // Pessimistic lock khi update/delete
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT e FROM EmployeeWageConfigEntity e
        WHERE e.id = :id
          AND e.farm.id = :farmId
        """)
    Optional<EmployeeWageConfigEntity> findByIdAndFarmIdForUpdate(
            @Param("id")     UUID id,
            @Param("farmId") UUID farmId);

    // Kiểm tra config đã được dùng trong work_log chưa
    @Query("""
        SELECT COUNT(wl) > 0 FROM WorkLogEntity wl
        WHERE wl.employee.id = :userId
          AND wl.farm.id     = :farmId
          AND wl.workDate    BETWEEN :effectiveFrom
                             AND COALESCE(:effectiveTo, wl.workDate)
        """)
    boolean isConfigReferencedByWorkLog(
            @Param("farmId")       UUID farmId,
            @Param("userId")       UUID userId,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo")   LocalDate effectiveTo);
}