package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanStageStatusHistoryResponse {
    PlanStageStatusResponse fromStatus;
    PlanStageStatusResponse toStatus;
    UserResponse changedBy;
    Instant changedAt;

}
