package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusTransitionResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanStageStatusMapper;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanStageStatusHistoryMapper;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanStageStatusTransitionMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlanStageStatusService {

    PlanStageStatusRepository planStageStatusRepository;
    PlanStageStatusMapper planStageStatusMapper;

    PlanStageStatusHistoryRepository planStageStatusHistoryRepository;
    PlanStageStatusHistoryMapper planStageStatusHistoryMapper;

    PlanStageStatusTransitionRepository planStageStatusTransitionRepository;
    PlanStageStatusTransitionMapper planStageStatusTransitionMapper;

    PlanStageRepository planStageRepository;
    UserRepository userRepository;
    FarmRepository farmRepository;
    SecurityUtils securityUtils;

    public List<PlanStageStatusResponse> findAllPlanStageStatus() {
        return planStageStatusMapper.toResponses(planStageStatusRepository.findAll());
    }

    public List<PlanStageStatusResponse> findAllPlanStageStatusAvailableByPlanStageAndFarm(UUID planStageId) {
        UUID farmId = securityUtils.getCurrentFarmId();
        return planStageStatusMapper.toResponses(planStageStatusRepository.findAllByPlanStage_IdAndFarm_IdAndStatusAvailable(planStageId,farmId));
    }

    public List<PlanStageStatusHistoryResponse> findAllPlanStageStatusHistory(UUID planId, UUID stageId) {
        PlanStageEntity stage = planStageRepository
                .findByIdAndPlanId(stageId, planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        return planStageStatusHistoryMapper.toResponses(
                planStageStatusHistoryRepository.findAllByPlanStage_Id(stage.getId())
        );
    }

    @Transactional(readOnly = true)
    public List<PlanStageStatusTransitionResponse> findAllPlanStageStatusTransitionByFarm() {
        UUID farmId = securityUtils.getCurrentFarmId();
        return planStageStatusTransitionMapper.toResponses(
                planStageStatusTransitionRepository.findAllByFarm_Id(farmId)
        );
    }

    @Transactional
    public PlanStageStatusHistoryResponse updatePlanStageStatus(
            UUID planId, UUID stageId, UUID toStatusId) {

        UUID farmId = securityUtils.getCurrentFarmId();
        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity changedBy = userRepository.getReferenceById(securityUtils.getCurrentUserId());

        // 1. Lock row — tránh race condition
        PlanStageEntity stage = planStageRepository
                .findByIdForUpdate(stageId, planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        // 2. Kiểm tra stage đã terminal chưa
        PlanStageStatusEntity currentStatus = stage.getStatus();
        if (currentStatus.getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        // 3. Kiểm tra actualEndDate — stage đã kết thúc thực tế
        if (stage.getActualEndDate() != null
                && LocalDate.now().isAfter(stage.getActualEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        // 4. Kiểm tra toStatus tồn tại
        PlanStageStatusEntity toStatus = planStageStatusRepository
                .findById(toStatusId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_STATUS_NOT_FOUND));

        // 5. Kiểm tra transition hợp lệ (kể cả global farm_id IS NULL)
        if (!planStageStatusTransitionRepository
                .existsByFromAndToStatus(farmId, currentStatus.getId(), toStatus.getId()))
            throw new AppException(ErrorCode.PLAN_STAGE_STATUS_TRANSITION_NOT_FOUND);

        // 6. Set actualStartDate khi bắt đầu thực sự (initial → non-initial)
        if (currentStatus.getIsInitial() && !toStatus.getIsInitial()
                && stage.getActualStartDate() == null) {

            if (planStageRepository.existsByPlanIdAndDateBetweenStartAndEndWithoutId(
                    planId, LocalDate.now(), stage.getId()))
                throw new AppException(ErrorCode.PLAN_STAGE_CANNOT_START_CAUSE_STAGE_IN_FUTURE);

            stage.setActualStartDate(LocalDate.now());
        }

        // 7. Set actualEndDate khi terminal
        if (toStatus.getIsTerminal()) {
            if (stage.getActualStartDate() == null)
                stage.setActualStartDate(LocalDate.now());

            stage.setActualEndDate(LocalDate.now());
        }

        // 8. Update status
        stage.setStatus(toStatus);

        // 9. Ghi lịch sử
        PlanStageStatusHistoryEntity history = new PlanStageStatusHistoryEntity();
        history.setPlanStage(stage);
        history.setFarm(farm);
        history.setFromStatus(currentStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(changedBy);
        history.setChangedAt(Instant.now());

        return planStageStatusHistoryMapper.toResponse(
                planStageStatusHistoryRepository.save(history));
    }
}
