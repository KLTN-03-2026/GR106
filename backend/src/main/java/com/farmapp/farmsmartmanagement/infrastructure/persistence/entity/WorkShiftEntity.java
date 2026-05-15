package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "work_shifts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"farm_id", "name"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkShiftEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @Column(name = "name", length = 100, nullable = false)
    String name;

    @Column(name = "start_time", nullable = false)
    LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalTime endTime;

    @Column(name = "coefficient", precision = 4, scale = 2, nullable = false)
    BigDecimal coefficient = BigDecimal.valueOf(1.0);

    @Column(name = "is_active", nullable = false)
    boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();
}

