package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkLogMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkLogMaterialRepository extends JpaRepository<WorkLogMaterialEntity, UUID> {
    void deleteAllByWorkLog_Id(UUID workLogId);
}
