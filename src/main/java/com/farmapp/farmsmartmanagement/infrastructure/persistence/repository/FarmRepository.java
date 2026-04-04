package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FarmRepository extends JpaRepository<FarmEntity, UUID> {

    List<FarmEntity> findByOwner_Id(UUID ownerId);

    boolean existsByOwner_IdAndName(UUID ownerId, String name);
}