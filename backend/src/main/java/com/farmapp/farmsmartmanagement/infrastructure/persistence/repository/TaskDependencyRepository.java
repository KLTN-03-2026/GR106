package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;


import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskDependencyEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskDependencyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskDependencyRepository extends JpaRepository<TaskDependencyEntity, TaskDependencyId> {

    // Lấy tất cả dependency của một task
    List<TaskDependencyEntity> findAllByTask_Id(UUID taskId);

    // Lấy tất cả task phụ thuộc vào một task khác
    List<TaskDependencyEntity> findAllByDependsOnTask_Id(UUID dependsOnTaskId);

    // Kiểm tra xem task có phụ thuộc vào task khác không
    boolean existsByTask_IdAndDependsOnTask_Id(UUID taskId, UUID dependsOnTaskId);

    void deleteByTask_IdAndDependsOnTask_Id(UUID taskId, UUID dependsOnTaskId);

    void deleteByTask_IdOrDependsOnTask_Id(UUID taskId, UUID dependsOnTaskId);

    @Query(value = """
    WITH RECURSIVE dep_chain AS (
        SELECT depends_on_task_id
        FROM task_dependencies
        WHERE task_id = :dependsOnTaskId

        UNION ALL

        SELECT td.depends_on_task_id
        FROM task_dependencies td
        JOIN dep_chain dc ON td.task_id = dc.depends_on_task_id
    )
    SELECT COUNT(*) > 0
    FROM dep_chain
    WHERE depends_on_task_id = :taskId
    """, nativeQuery = true)
    boolean existsCircularDependency(
            @Param("taskId") UUID taskId,
            @Param("dependsOnTaskId") UUID dependsOnTaskId);
}