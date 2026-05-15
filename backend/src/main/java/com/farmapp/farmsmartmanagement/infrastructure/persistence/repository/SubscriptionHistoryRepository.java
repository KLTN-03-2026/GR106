package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SubscriptionHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SubscriptionHistoryRepository
        extends JpaRepository<SubscriptionHistoryEntity, UUID> {

    List<SubscriptionHistoryEntity> findByFarmIdOrderByCreatedAtDesc(UUID farmId);
}