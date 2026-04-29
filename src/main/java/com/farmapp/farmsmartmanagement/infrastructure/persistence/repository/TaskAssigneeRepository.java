package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskAssigneeEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TaskAssigneeRepository extends JpaRepository<TaskAssigneeEntity, UUID> {
    @Query("""
        SELECT ta FROM TaskAssigneeEntity ta
        WHERE ta.task.id = :taskId
        AND ta.task.planStage.id = :stageId
        AND ta.task.planStage.plan.id = :planId
    """)
    @EntityGraph(attributePaths = {"user","assignedBy", "removedBy"})
    List<TaskAssigneeEntity> findAllByPlan_IdAndStage_IdAndTask_Id(UUID planId, UUID stageId, UUID taskId);

    boolean existsByTask_IdAndUser_Id(UUID taskId, UUID userId);
}
