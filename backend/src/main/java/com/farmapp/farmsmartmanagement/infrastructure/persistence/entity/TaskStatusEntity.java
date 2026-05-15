package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "task_statuses")
@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatusEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @Column(name = "code", length = 50, unique = true, nullable = false)
    String code;

    @Column(name = "name", length = 100, nullable = false)
    String name;

    @Column(name = "is_initial", nullable = false)
    Boolean isInitial;

    @Column(name = "is_terminal", nullable = false)
    Boolean isTerminal;

    @Column(name = "order_index", nullable = false)
    Integer orderIndex;

    @Column(name = "color", length = 20)
    String color;

    @Column(name = "created_at", nullable = false)
    Instant createdAt;
}
