package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSummaryResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSupperSummaryResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatusTransitionResponse {
    FarmSupperSummaryResponse farm;

    TaskStatusResponse fromStatus;
    TaskStatusResponse toStatus;

    FarmRoleResponse farmRole;

    Instant createdAt;
}
