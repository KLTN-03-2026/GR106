package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CropStageRepository extends JpaRepository<CropStageEntity, UUID> {
}
