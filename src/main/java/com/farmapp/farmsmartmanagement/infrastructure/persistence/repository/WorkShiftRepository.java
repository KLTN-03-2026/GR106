package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkShiftEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkShiftRepository extends JpaRepository<WorkShiftEntity, UUID> {
    List<WorkShiftEntity> findAllByFarm_IdOrderByCreatedAtAsc(UUID farmId);

    boolean existsByFarm_IdAndNameAndIdNot(UUID farmId, String name, UUID excludeId);

    boolean existsByFarm_IdAndName(UUID farmId, String name);

    long countByFarm_IdAndIsActiveTrue(UUID farmId);

    long countByFarm_Id(UUID farmId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT ws FROM WorkShiftEntity ws
        WHERE ws.id = :id
          AND ws.farm.id = :farmId
        """)
    Optional<WorkShiftEntity> findByIdAndFarmIdForUpdate(
            @Param("id")     UUID id,
            @Param("farmId") UUID farmId);

    @Query("""
        SELECT COUNT(wl) > 0 FROM WorkLogEntity wl
        WHERE wl.shift.id = :shiftId
        """)
    boolean isShiftReferencedByWorkLog(@Param("shiftId") UUID shiftId);
}
