package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.DiagnosisSource;
import com.farmapp.farmsmartmanagement.domain.enums.DiagnosisStatus;
import com.farmapp.farmsmartmanagement.domain.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "diagnoses", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisEntity {

    @Id
    @GeneratedValue(generator = "uuid-v7")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plot_id")
    private PlotEntity plot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id")
    private CropEntity crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private UserEntity requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private DiagnosisSource source;

    @Column(name = "disease_name", length = 200)
    private String diseaseName;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity")
    private SeverityLevel severity;

    @Column(name = "confidence", precision = 4, scale = 3)
    private Double confidence;

    @Column(name = "treatment")
    private String treatment;

    @Column(name = "alternatives", columnDefinition = "jsonb")
    private String alternatives;

    @Column(name = "needs_expert", nullable = false)
    private boolean needsExpert = false;

    @Column(name = "ai_model", length = 50, nullable = false)
    private String aiModel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DiagnosisStatus status = DiagnosisStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
