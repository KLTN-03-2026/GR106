package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.security.core.userdetails.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
@Entity
@Table(name = "employee_wage_configs",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"farm_id", "user_id", "effective_from"}
        ))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeWageConfigEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    UserEntity user;

    @Column(name = "daily_rate", nullable = false, precision = 15, scale = 2)
    BigDecimal dailyRate;

    @Column(name = "ot_multiplier", nullable = false, precision = 4, scale = 2)
    BigDecimal otMultiplier = new BigDecimal("1.5");

    @Column(name = "effective_from", nullable = false)
    LocalDate effectiveFrom;

    @Column(name = "effective_to")
    LocalDate effectiveTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt = Instant.now();
}
