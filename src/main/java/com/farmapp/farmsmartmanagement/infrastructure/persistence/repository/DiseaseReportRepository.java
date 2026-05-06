package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.DiseaseReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DiseaseReportRepository extends JpaRepository<DiseaseReportEntity, UUID> {
    void deleteByTask_Id(UUID taskId);
}
