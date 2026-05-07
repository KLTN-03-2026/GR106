package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkSessionPolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkSessionPolicyRepository extends JpaRepository<WorkSessionPolicyEntity, UUID> {

    Optional<WorkSessionPolicyEntity> findByFarm_Id(UUID farmId);
}