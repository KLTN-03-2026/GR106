package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanStageRepository extends JpaRepository<PlanStageEntity, UUID> {

    List<PlanStageEntity> findByPlan_IdOrderByOrderIndexAsc(UUID planId);
}