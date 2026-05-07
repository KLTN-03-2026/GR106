package com.farmapp.farmsmartmanagement.modules.plan.validation;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;

import java.util.UUID;

public interface PlanStageValidator {

    // Dùng cho: read, createTask, updateTask
    PlanStageEntity validateAndGetStage(UUID stageId, UUID planId, UUID farmId);

    // Dùng cho: updateStatus — cần lock tránh race condition
    PlanStageEntity validateAndGetStageForUpdate(UUID stageId, UUID planId, UUID farmId);

}
