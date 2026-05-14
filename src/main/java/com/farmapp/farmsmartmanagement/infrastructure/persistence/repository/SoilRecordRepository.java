package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SoilRecordEntity;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SoilRecordRepository extends JpaRepository<SoilRecordEntity, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT sr FROM SoilRecordEntity sr WHERE sr.id = :id
            """)
    Optional<SoilRecordEntity> findByIdForUpdate(@Param("id") UUID id);

    Optional<SoilRecordEntity> findByIdAndFarm_Id(UUID soilRecordId, UUID farmId);

    List<SoilRecordEntity> findByFarm_Id(UUID farmId);

    List<SoilRecordEntity> findByPlot_Id(UUID plotId);
}
