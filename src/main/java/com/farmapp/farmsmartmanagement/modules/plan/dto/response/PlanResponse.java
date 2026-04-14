package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PlanStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanResponse {
    UUID id;
    UUID cloned_from_id;
    String name;
    Instant start_date;
    Instant end_date;
    PlanStatus status;
    String note;
}
