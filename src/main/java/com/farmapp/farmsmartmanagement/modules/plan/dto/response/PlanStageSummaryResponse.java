package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PlanStageSource;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanStageSummaryResponse {
    UUID id;

    UUID planId;

    String name;

    PlanStageSource source;

    LocalDate startDate;
    LocalDate actualStartDate;
    LocalDate endDate;
    LocalDate actualEndDate;
    String aiSuggestionCache;

    PlanStageStatusResponse status;
}
