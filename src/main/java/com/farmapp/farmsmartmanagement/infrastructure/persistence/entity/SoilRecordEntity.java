package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "soil_records")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SoilRecordEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plot_id", nullable = false)
    PlotEntity plot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    UserEntity createdBy;

    @Column(name = "sampled_at", nullable = false)
    LocalDate sampledAt;

    @Column(name = "ph", precision = 4, scale = 2)
    BigDecimal ph;

    @Column(name = "nitrogen_mg_kg", precision = 8, scale = 2)
    BigDecimal nitrogenMgKg;

    @Column(name = "phosphorus_mg_kg", precision = 8, scale = 2)
    BigDecimal phosphorusMgKg;

    @Column(name = "potassium_mg_kg", precision = 8, scale = 2)
    BigDecimal potassiumMgKg;

    @Column(name = "moisture_percent", precision = 5, scale = 2)
    BigDecimal moisturePercent;

    @Column(name = "notes")
    String notes;

    @Column(name = "source_file_url")
    String sourceFileUrl;

    @Column(name = "locked_at")
    Instant lockedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @Column(name = "deleted_at")
    Instant deletedAt;
}
