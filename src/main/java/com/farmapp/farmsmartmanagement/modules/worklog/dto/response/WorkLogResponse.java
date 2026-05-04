package com.farmapp.farmsmartmanagement.modules.worklog.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.WorkLogType;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSummaryResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkLogResponse {

    UUID id;
    WorkLogType type;
    Boolean isOverTime;
    String notes;
    TaskResponse task;

    FarmSummaryResponse farm;

    UserResponse employee;

    LocalDate workDate;
}
