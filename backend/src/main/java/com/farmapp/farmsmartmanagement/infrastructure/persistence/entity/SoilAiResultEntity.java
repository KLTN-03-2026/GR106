package com.farmapp.farmsmartmanagement.modules.soilrecord.entity;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlotEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SoilRecordEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "soil_ai_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SoilAiResultEntity {

    @Id
    @GeneratedValue
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soil_record_id", nullable = false)
    SoilRecordEntity soilRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plot_id", nullable = false)
    PlotEntity plot;

    // Quan hệ tới FarmEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    UserEntity requestedBy;

    @Column(name = "source_file_url", nullable = false)
    String sourceFileUrl;

    @Column(name = "extracted_data", nullable = false, columnDefinition = "TEXT")
    String extractedData;

    @Column(name = "ai_suggestions", nullable = false, columnDefinition = "TEXT")
    String aiSuggestions;

    @Column(name = "ai_model", nullable = false, length = 50)
    String aiModel;

    @Column(name = "created_at", nullable = false)
    Instant createdAt;

    @Column(name = "deleted_at")
    Instant deletedAt;
}
