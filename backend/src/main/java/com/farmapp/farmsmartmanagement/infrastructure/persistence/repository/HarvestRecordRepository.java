package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.HarvestRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HarvestRecordRepository extends JpaRepository<HarvestRecordEntity, UUID> {
    boolean existsByPlanStage_Id(UUID stageId);
}
