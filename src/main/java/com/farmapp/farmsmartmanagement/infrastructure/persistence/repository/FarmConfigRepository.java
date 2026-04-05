// FarmConfigRepository.java
package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FarmConfigRepository extends JpaRepository<FarmConfigEntity, UUID> {

    Optional<FarmConfigEntity> findByFarmId(UUID farmId);
}