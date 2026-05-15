package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "plan_plots")
@Getter
@Setter
public class PlanPlotEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    PlanEntity plan;

    @ManyToOne(fetch = FetchType.LAZY)
            @JoinColumn(name = "plot_id", nullable = false)
    PlotEntity plot;

    @Column(length = 150,nullable = false)
    String plotNameSnapshot;

    @Column(name = "created_at")
    Instant createdAt;
}
