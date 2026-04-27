package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskResponse {

    UUID id;

    UUID planStageId;
    UUID farmId;
    UUID plotId;

    TaskStatusResponse status;

    String name;
    String description;

    LocalDate startDate;
    LocalDate endDate;

    BigDecimal progressPercent;

    Instant acceptedAt;
    Instant completedAt;

    UUID createdBy;
    Instant createdAt;
}