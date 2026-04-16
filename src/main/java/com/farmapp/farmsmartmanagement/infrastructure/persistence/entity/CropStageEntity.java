package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "crop_stages")
@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CropStageEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    CropEntity crop;

    @Column(name = "name", length = 150, nullable = false)
    String name;

    @Column(name = "order_index", nullable = false)
    Integer orderIndex;

    @Column(name = "duration_days", nullable = false)
    Integer durationDays;

    @Column(name = "description")
    String description;
}
