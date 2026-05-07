package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.domain.enums.ForceTargetType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.ForceActionLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ForceActionLogRepository extends JpaRepository<ForceActionLogEntity, UUID> {

    List<ForceActionLogEntity> findAllByFarm_IdAndTargetTypeAndTargetIdOrderByPerformedAtDesc(
            UUID farmId, ForceTargetType targetType, UUID targetId);
}