package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskStatusRepository extends JpaRepository<TaskStatusEntity, UUID> {
    TaskStatusEntity findByIsInitialTrue();

    Optional<TaskStatusEntity> findByCode(String todo);

    @Query("""
        SELECT ts
        FROM TaskEntity t
        JOIN TaskStatusTransitionEntity tst
            ON t.status.id = tst.fromStatus.id
           AND tst.farm.id = :farmId
        JOIN TaskStatusEntity ts
            ON ts.id = tst.toStatus.id
        WHERE t.id = :taskId
    """)
    List<TaskStatusEntity> findByTask_IdAndFarm_IdAndStatusAvailable(@Param("taskId") UUID taskId,@Param("farmId") UUID farmId);

}
