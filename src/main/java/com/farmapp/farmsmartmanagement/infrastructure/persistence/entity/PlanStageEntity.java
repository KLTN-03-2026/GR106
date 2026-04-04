package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "plan_stages")
@Getter
@Setter
public class PlanStageEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanEntity plan;

    @Column(nullable = false)
    private String name;

    @Column(name = "order_index")
    private Short orderIndex;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}