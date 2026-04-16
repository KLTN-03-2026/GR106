package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PlanStageSource;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanStageResponse {
    UUID id;

    UUID planId;

    String name;

    PlanStageSource source;

    Integer orderIndex;

    LocalDate startDate;
    LocalDate endDate;

    String aiSuggestionCache;

    PlanStageStatusResponse status;
}
