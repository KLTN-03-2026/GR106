package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscription_history")
@Getter
@Setter
public class SubscriptionHistoryEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_subscription_id", nullable = false)
    private FarmSubscriptionEntity farmSubscription;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_subscription_plan_id")
    private SubscriptionPlanEntity fromPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_subscription_plan_id")
    private SubscriptionPlanEntity toPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by")
    private UserEntity triggeredBy;

    private String notes;

    @Column(name = "created_at")
    private Instant createdAt;
}