package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusTransitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface PlanStageStatusTransitionRepository extends JpaRepository<PlanStageStatusTransitionEntity, UUID> {
    List<PlanStageStatusTransitionEntity> findAllByFarm_Id(UUID farmId);
    boolean existsByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID fromStatusId, UUID toStatusId);

    Optional<PlanStageStatusTransitionEntity> findByFarm_IdAndFromStatus_IdAndToStatus_Id(UUID farmId, UUID id, UUID id1);
}