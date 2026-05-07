package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "work_session_policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkSessionPolicyEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false, unique = true)
    FarmEntity farm;

    @Column(name = "auto_close_enabled", nullable = false)
    boolean autoCloseEnabled = true;

    @Column(name = "auto_close_time", nullable = false)
    LocalTime autoCloseTime = LocalTime.of(20, 0);

    @Column(name = "max_session_hours", nullable = false)
    short maxSessionHours = 12;

    @Column(name = "require_checkout_note", nullable = false)
    boolean requireCheckoutNote = false;

    @Column(name = "allow_manual_checkout", nullable = false)
    boolean allowManualCheckout = true;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    Instant updatedAt;
}