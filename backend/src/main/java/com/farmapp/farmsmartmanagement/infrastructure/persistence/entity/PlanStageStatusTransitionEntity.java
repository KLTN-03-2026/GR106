package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "plan_stage_status_transitions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"farm_id", "from_status_id", "to_status_id"})
        },
        indexes = {
                @Index(name = "idx_psst_lookup", columnList = "farm_id, from_status_id")
        }
)
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanStageStatusTransitionEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_status_id", nullable = false)
    PlanStageStatusEntity fromStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_status_id", nullable = false)
    PlanStageStatusEntity toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_role_id")
    FarmRoleEntity farmRole;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();
}
