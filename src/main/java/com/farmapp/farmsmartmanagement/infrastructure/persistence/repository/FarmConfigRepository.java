// FarmConfigRepository.java
package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmConfigEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface FarmConfigRepository extends JpaRepository<FarmConfigEntity, UUID> {

    Optional<FarmConfigEntity> findByFarmId(UUID farmId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT fc FROM FarmConfigEntity fc
        WHERE fc.farmId = :farmId
        """)
    Optional<FarmConfigEntity> findByFarmIdForUpdate(@Param("farmId") UUID farmId);

}