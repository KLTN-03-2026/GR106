package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageAiSuggestionCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanStageAiSuggestionCacheRepository
        extends JpaRepository<PlanStageAiSuggestionCacheEntity, UUID> {

    List<PlanStageAiSuggestionCacheEntity> findByPlanStageId(UUID planStageId);

    boolean existsByPlanStageId(UUID id);

    boolean existsByPlanStage_Id(UUID planStageId);
}