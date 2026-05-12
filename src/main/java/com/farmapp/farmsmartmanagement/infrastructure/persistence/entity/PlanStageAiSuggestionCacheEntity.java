package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "plan_stage_ai_suggestion_cache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanStageAiSuggestionCacheEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_stage_id", nullable = false)
    PlanStageEntity planStage;

    @Column(name = "title")
    String title;

    @Column(name = "description")
    String description;

    @Column(name = "priority")
    Short priority;

    @Column(name = "estimated_days")
    Short estimatedDays;

    @Column(name = "category", length = 20)
    String category;

    @Column(name = "created_at", nullable = false)
    Instant createdAt;
}
