    package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

    import jakarta.persistence.Column;
    import jakarta.persistence.Embeddable;
    import lombok.Data;

    import java.io.Serializable;
    import java.util.UUID;

    @Data
    @Embeddable
    public class TaskDependencyId implements Serializable {
        @Column(name = "task_id")
        private UUID taskId;

        @Column(name = "depends_on_task_id")
        private UUID dependsOnTaskId;

    }

