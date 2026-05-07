package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "work_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkSessionEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_log_id")
    WorkLogEntity workLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    UserEntity employee;

    @Column(name = "checked_in_at", nullable = false)
    Instant checkedInAt = Instant.now();

    @Column(name = "checked_out_at")
    Instant checkedOutAt;

    @Column(name = "check_in_note")
    String checkInNote;

    @Column(name = "check_out_note")
    String checkOutNote;

    // ── Manual adjustment ─────────────────────────────────────────────────────
    @Column(name = "checked_out_at_original")
    Instant checkedOutAtOriginal; // giá trị cũ trước khi sửa

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjusted_by")
    UserEntity adjustedBy;

    @Column(name = "adjusted_at")
    Instant adjustedAt;

    @Column(name = "adjust_reason")
    String adjustReason;

    // ── Force close ───────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "force_action_log_id")
    ForceActionLogEntity forceActionLog;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();

    // ── Helpers ───────────────────────────────────────────────────────────────
    public boolean isOpen() {
        return checkedOutAt == null;
    }

    public boolean isForceClose() {
        return forceActionLog != null;
    }
}