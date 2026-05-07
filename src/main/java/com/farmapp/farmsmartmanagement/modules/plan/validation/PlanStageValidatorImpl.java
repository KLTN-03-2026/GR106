package com.farmapp.farmsmartmanagement.modules.plan.validation;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlanStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PlanStageValidatorImpl implements PlanStageValidator {

    private final PlanStageRepository planStageRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Public methods
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public PlanStageEntity validateAndGetStage(UUID stageId, UUID planId, UUID farmId) {
        PlanStageEntity stage = planStageRepository
                .findByIdAndPlanIdAndDeletedAtIsNull(stageId, planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        validateExpired(stage);
        return stage;
    }

    @Override
    public PlanStageEntity validateAndGetStageForUpdate(UUID stageId, UUID planId, UUID farmId) {
        PlanStageEntity stage = planStageRepository
                .findByIdForUpdate(stageId, planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        validateExpired(stage);
        return stage;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Private — dùng chung
    // ─────────────────────────────────────────────────────────────────────────

    private void validateExpired(PlanStageEntity stage) {

        // Stage đã terminal
        if (stage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        // Stage đã kết thúc thực tế
        if (stage.getActualEndDate() != null
                && LocalDate.now().isAfter(stage.getActualEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_EXPIRED);

        // Không check endDate — thực tế có thể làm trễ hơn kế hoạch
    }
}
