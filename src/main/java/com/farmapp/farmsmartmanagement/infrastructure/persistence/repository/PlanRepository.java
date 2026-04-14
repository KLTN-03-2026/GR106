package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanEntity;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<PlanEntity, UUID> {

    List<PlanEntity> findByFarm_Id(UUID farmId);

    boolean existsByFarmIdAndName(UUID id, String name);
}