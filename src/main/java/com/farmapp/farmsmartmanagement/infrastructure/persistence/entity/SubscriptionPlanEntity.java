package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
public class SubscriptionPlanEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "price_monthly", nullable = false)
    private BigDecimal priceMonthly;

    @Column(name = "price_annual")
    private BigDecimal priceAnnual;

    @Column(name = "max_plots", nullable = false)
    private Short maxPlots;

    @Column(name = "max_members", nullable = false)
    private Short maxMembers;

    @Column(name = "has_ai_diagnosis", nullable = false)
    private Boolean hasAiDiagnosis;

    @Column(name = "has_pdf_export", nullable = false)
    private Boolean hasPdfExport;

    @Column(name = "has_map", nullable = false)
    private Boolean hasMap;

    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}