package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmployeeWageConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeWageConfigRepository
        extends JpaRepository<EmployeeWageConfigEntity, UUID> {

    // Tìm config lương theo SCD Type 2
    @Query("""
        SELECT e FROM EmployeeWageConfigEntity e
        WHERE e.farm.id = :farmId
          AND e.user.id = :userId
          AND e.effectiveFrom <= :workDate
          AND (e.effectiveTo IS NULL OR e.effectiveTo >= :workDate)
        """)
    Optional<EmployeeWageConfigEntity> findActiveConfig(
            @Param("farmId") UUID farmId,
            @Param("userId") UUID userId,
            @Param("workDate") LocalDate workDate);

    List<EmployeeWageConfigEntity> findAllByFarm_IdAndUser_IdOrderByEffectiveFromDesc(
            UUID farmId, UUID userId);
}