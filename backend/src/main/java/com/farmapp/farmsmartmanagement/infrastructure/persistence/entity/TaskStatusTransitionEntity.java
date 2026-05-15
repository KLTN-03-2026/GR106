package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "task_status_transitions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"farm_id", "from_status_id", "to_status_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatusTransitionEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_status_id", nullable = false)
    TaskStatusEntity fromStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_status_id", nullable = false)
    TaskStatusEntity toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_role_id")
    FarmRoleEntity farmRole;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();
}
