package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;


@Entity
@Table(name = "warehouse_locations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "code"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseLocationEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    WarehouseEntity warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @Column(name = "code", length = 50, nullable = false)
    String code;

    @Column(name = "name", length = 150, nullable = false)
    String name;

    @Column(name = "description")
    String description;

    @Column(name = "is_active", nullable = false)
    boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();

    @Column(name = "deleted_at")
    Instant deletedAt;
}
