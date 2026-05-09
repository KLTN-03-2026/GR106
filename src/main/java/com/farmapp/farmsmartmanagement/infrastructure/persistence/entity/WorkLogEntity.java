package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.WorkLogStatus;
import com.farmapp.farmsmartmanagement.domain.enums.WorkLogType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;



@Entity
@Table(name = "work_logs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "employee_id", "work_date", "shift_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkLogEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    UserEntity employee;

    @Column(name = "work_date", nullable = false)
    LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkLogStatus status;

    @OneToMany(mappedBy = "workLog", cascade = CascadeType.ALL, orphanRemoval = true)
    List<WorkLogMaterialEntity> materials;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    WorkShiftEntity shift;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false)
    WorkLogType type = WorkLogType.NORMAL;

    @Column(name = "is_overtime", nullable = false)
    boolean isOvertime = false;

    @Column(name = "notes")
    String notes;

    @Column(name = "locked_at")
    Instant lockedAt;

    @Column(name = "created_at", nullable = false)
    Instant createdAt = Instant.now();

    @Column(name = "deleted_at")
    Instant deletedAt;
}
