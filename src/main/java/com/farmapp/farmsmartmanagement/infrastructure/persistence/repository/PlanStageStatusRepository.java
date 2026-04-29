package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanStageStatusRepository extends JpaRepository<PlanStageStatusEntity, UUID> {
    List<PlanStageStatusEntity> findByIsInitialTrue(Pageable pageable);

    Optional<PlanStageStatusEntity> findByCode(String active);
}
