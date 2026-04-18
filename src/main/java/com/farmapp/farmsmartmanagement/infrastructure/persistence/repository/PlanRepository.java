package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<PlanEntity, UUID> {

    List<PlanEntity> findByFarm_Id(UUID farmId);

    boolean existsByFarm_IdAndName(UUID id, String name);

    boolean existsByFarm_Id(UUID farmId);

    Optional<PlanEntity> findByIdAndFarm_Id(UUID planId, UUID farmId);
}