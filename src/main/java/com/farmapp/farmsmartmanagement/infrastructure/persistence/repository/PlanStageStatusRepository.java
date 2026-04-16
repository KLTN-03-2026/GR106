package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanStageStatusRepository extends JpaRepository<PlanStageStatusEntity, Integer> {
    List<PlanStageStatusEntity> findByIsInitialTrue(Pageable pageable);
}
