package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.common.constant.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmSubscriptionRepository
        extends JpaRepository<FarmSubscriptionEntity, UUID> {

    Optional<FarmSubscriptionEntity> findByFarmIdAndIsCurrentTrue(UUID farmId);

    List<FarmSubscriptionEntity> findByFarmIdOrderByStartedAtDesc(UUID farmId);

    boolean existsByFarmIdAndStatus(UUID farmId, SubscriptionStatus status);
}