package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;


@Entity
@Table(name = "units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UnitEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @Column(name = "code", nullable = false, unique = true)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "unit_type", nullable = false)
    String unitType;

    @Column(name = "created_at", updatable = false)
    Instant createdAt = Instant.now();
}