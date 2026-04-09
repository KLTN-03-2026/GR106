package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FarmSubscriptionRepository extends JpaRepository<FarmSubscriptionEntity, UUID> {

    Optional<FarmSubscriptionEntity> findByFarmAndIsCurrent(FarmEntity farm, Boolean isCurrent);

    Collection<FarmSubscriptionEntity> findByFarm_Id(UUID farmId);
}