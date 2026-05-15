package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanStageStatusHistoryRepository extends JpaRepository<PlanStageStatusHistoryEntity, UUID> {
    List<PlanStageStatusHistoryEntity> findAllByPlanStage_Id(UUID planStageId);
}