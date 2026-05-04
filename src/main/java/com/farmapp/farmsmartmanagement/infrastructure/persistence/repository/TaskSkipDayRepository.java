package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskSkipDayEntity;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface TaskSkipDayRepository extends JpaRepository<TaskSkipDayEntity, UUID> {
    boolean existsByTask_IdAndSkipDate(UUID taskId, @NotNull(message = "Ngày làm việc không được để trống") LocalDate workDate);
}
