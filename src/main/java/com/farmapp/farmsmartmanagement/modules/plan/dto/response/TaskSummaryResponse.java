package com.farmapp.farmsmartmanagement.modules.plan.dto.response;


import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TaskSummaryResponse {
    UUID id;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    TaskStatusResponse status;
}
