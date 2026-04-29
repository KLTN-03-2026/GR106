package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanStageStatusTransitionResponse {
    UUID id;
    PlanStageStatusResponse fromStatus;
    PlanStageStatusResponse toStatus;
    FarmRoleResponse farmRole;
    Instant createdAt;

}
