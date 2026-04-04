package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {

    List<TaskEntity> findByFarm_Id(UUID farmId);

    List<TaskEntity> findByPlanStage_Id(UUID planStageId);

    List<TaskEntity> findByPlot_Id(UUID plotId);
}