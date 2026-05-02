package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PlanStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanResponse {
    UUID id;
    Long version;
    UUID farmId;
    UUID clonedFromId;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    PlanStatus status;
    String note;
    UUID createdById;
    Instant createdAt;
    Instant deletedAt;
}
