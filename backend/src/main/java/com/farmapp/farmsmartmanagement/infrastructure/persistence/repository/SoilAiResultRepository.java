package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.farmapp.farmsmartmanagement.modules.soilrecord.entity.SoilAiResultEntity;
import java.util.UUID;

public interface SoilAiResultRepository extends JpaRepository<SoilAiResultEntity, UUID> {
    void deleteAllBySoilRecordId(UUID id);
}
