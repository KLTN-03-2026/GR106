package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@Table(name = "task_dependencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskDependencyEntity {
    @EmbeddedId
    TaskDependencyId id = new TaskDependencyId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("taskId")
    @JoinColumn(name = "task_id", nullable = false)
    TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dependsOnTaskId")
    @JoinColumn(name = "depends_on_task_id", nullable = false)
    TaskEntity dependsOnTask;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();
}
