package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.PlanStageSource;
import com.farmapp.farmsmartmanagement.domain.enums.PlanStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanStageRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdatePlanStageRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdatePlanStageTimeRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanStageMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
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
public class PlanStageService {

    PlanRepository planRepository;
    PlanStageRepository planStageRepository;
    PlanStageStatusRepository planStageStatusRepository;
    FarmRepository farmRepository;
    TaskRepository taskRepository;
    DiseaseReportRepository diseaseReportRepository;
    WorkLogRepository workLogRepository;
    HarvestRecordRepository harvestRecordRepository;
    CropStageRepository cropStageRepository;


    PlanStageMapper planStageMapper;

    SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<PlanStageResponse> findAll(){
        return planStageMapper.toResponses(
                planStageRepository.findAll()
        );
    }


    // =========================================================================
    // READ
    // =========================================================================

    @Transactional(readOnly = true)
    public List<PlanStageResponse> findAllByPlanId(UUID planId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        getPlanOrThrow(planId, farmId);   // validate ownership

        return planStageMapper.toResponses(
                planStageRepository.findAllByPlanIdAndDeletedAtIsNullOrderByStartDateAsc(planId)
        );
    }

    @Transactional(readOnly = true)
    public PlanStageResponse findByIdAndPlanId(UUID stageId, UUID planId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        getPlanOrThrow(planId, farmId);

        return planStageMapper.toResponse(
                getStageOrThrow(stageId, planId)
        );
    }

    // =========================================================================
    // CREATE — CUSTOM
    // =========================================================================

    @Transactional
    public PlanStageResponse createPlanStageCustom(UUID planId,
                                                   CreatePlanStageRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = getPlanOrThrow(planId, farmId);

        // Plan không được ở trạng thái terminal
        checkPlanNotTerminal(plan);

        // Tên không được trùng trong plan
        if (planStageRepository.existsByPlanIdAndNameAndDeletedAtIsNull(planId, request.getName()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_EXISTS);

        // startDate / endDate phải nằm trong plan
        checkDatesWithinPlan(plan, request.getStartDate(), request.getEndDate());

        // Không được overlap với stage khác (bỏ qua deleted)
        if (planStageRepository.existsOverlapping(planId, request.getStartDate(), request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);

        PlanStageStatusEntity initialStatus = getInitialStatus();

        PlanStageEntity stage = new PlanStageEntity();
        stage.setPlan(plan);
        stage.setName(request.getName());
        stage.setSource(PlanStageSource.CUSTOM);
        stage.setStartDate(request.getStartDate());
        stage.setEndDate(request.getEndDate());
        stage.setStatus(initialStatus);

        return planStageMapper.toResponse(planStageRepository.save(stage));
    }

    // =========================================================================
    // CREATE — TEMPLATE (admin only)
    // =========================================================================

//    @Transactional
//    public PlanStageResponse createPlanStageFromTemplate(UUID planId,
//                                                         CreatePlanStageFromTemplateRequest request) {
//        UUID farmId = securityUtils.getCurrentFarmId();
//
//        PlanEntity plan = getPlanOrThrow(planId, farmId);
//
//        checkPlanNotTerminal(plan);
//
//        // Lấy crop_stage để tính end_date
//        CropStageEntity cropStage = cropStageRepository
//                .findById(request.getCropStageId())
//                .orElseThrow(() -> new AppException(ErrorCode.CROP_STAGE_NOT_FOUND));
//
//        // Đảm bảo crop_stage thuộc crop của plan
//        if (!cropStage.getCrop().getId().equals(plan.getCrop().getId()))
//            throw new AppException(ErrorCode.CROP_STAGE_NOT_BELONG_TO_PLAN_CROP);
//
//        LocalDate startDate = request.getStartDate();
//        LocalDate endDate   = startDate.plusDays(cropStage.getDurationDays());
//
//        // Kiểm tra nằm trong plan
//        checkDatesWithinPlan(plan, startDate, endDate);
//
//        // Kiểm tra overlap
//        if (planStageRepository.existsOverlapping(planId, startDate, endDate))
//            throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);
//
//        PlanStageStatusEntity initialStatus = getInitialStatus();
//
//        PlanStageEntity stage = new PlanStageEntity();
//        stage.setPlan(plan);
//        stage.setCropStage(cropStage);
//        stage.setName(cropStage.getName());
//        stage.setSource(PlanStageSource.TEMPLATE);
//        stage.setStartDate(startDate);
//        stage.setEndDate(endDate);
//        stage.setStatus(initialStatus);
//
//        return planStageMapper.toResponse(planStageRepository.save(stage));
//    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    @Transactional
    public PlanStageResponse updatePlanStage(UUID planId,
                                             UUID stageId,
                                             UpdatePlanStageRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = getPlanOrThrow(planId, farmId);

        checkPlanNotTerminal(plan);

        PlanStageEntity stage = getStageOrThrow(stageId, planId);

        // Nếu có thay đổi thời gian
        if (request.getStartDate() != null && request.getEndDate() != null) {

            checkDatesWithinPlan(plan, request.getStartDate(), request.getEndDate());

            if (planStageRepository.existsOverlappingWithoutId(
                    planId, stageId, request.getStartDate(), request.getEndDate()))
                throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);

            // Task bên trong không được lệch ra ngoài khoảng thời gian mới
            if (taskRepository.existsTaskOutsideStage(
                    stageId, request.getStartDate(), request.getEndDate()))
                throw new AppException(ErrorCode.PLAN_STAGE_NOT_COVER_TASK);
        }

        // Tên mới không được trùng với stage khác trong plan
        if (request.getName() != null
                && !request.getName().equals(stage.getName())
                && planStageRepository.existsByPlanIdAndNameAndDeletedAtIsNull(planId, request.getName()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_EXISTS);

        if(stage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        planStageMapper.updateEntityFromRequest(request, stage);

        return planStageMapper.toResponse(planStageRepository.save(stage));
    }

    // =========================================================================
    // DELETE
    // =========================================================================


    //
    @Transactional
    public PlanStageResponse updatePlanStageTime(UUID planId,
                                                 UUID planStageId,
                                                 UpdatePlanStageTimeRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = getPlanOrThrow(planId, farmId);

        checkPlanNotTerminal(plan);

        PlanStageEntity planStage = getStageOrThrow(planStageId, planId);

        checkDatesWithinPlan(plan, request.getStartDate(), request.getEndDate());

        if (planStageRepository.existsOverlappingWithoutId(
                planId, planStageId, request.getStartDate(), request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);

        if (taskRepository.existsTaskOutsideStage(
                planStageId, request.getStartDate(), request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_NOT_COVER_TASK);

        if(planStage.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_TERMINAL);

        planStage.setStartDate(request.getStartDate());
        planStage.setEndDate(request.getEndDate());

        return planStageMapper.toResponse(planStageRepository.save(planStage));
    }

    @Transactional
    public void deletePlanStage(UUID planId, UUID stageId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = getPlanOrThrow(planId, farmId);

        checkPlanNotTerminal(plan);

        PlanStageEntity stage = getStageOrThrow(stageId, planId);

        // Lớp 1 — Block nếu đã có harvest record
        if (harvestRecordRepository.existsByPlanStage_Id(stageId))
            throw new AppException(ErrorCode.PLAN_STAGE_HAS_HARVEST_RECORD);

        List<TaskEntity> tasks =
                taskRepository.findAllByPlanStage_IdAndDeletedAtIsNull(stageId);

        Instant now = Instant.now();

        for (TaskEntity task : tasks) {

            // Lớp 2 — Block nếu có work_log đã lock
            if (workLogRepository.existsByTask_IdAndLockedAtIsNotNull(task.getId()))
                throw new AppException(ErrorCode.PLAN_STAGE_HAS_LOCKED_WORK_LOG);

            // Lớp 3 — Soft delete work_log chưa lock
            List<WorkLogEntity> workLogs =
                    workLogRepository.findAllByTask_IdAndLockedAtIsNullAndDeletedAtIsNull(task.getId());
            workLogs.forEach(wl -> wl.setDeletedAt(now));
            workLogRepository.saveAll(workLogs);

            // Soft delete disease_report
            List<DiseaseReportEntity> reports =
                    diseaseReportRepository.findAllByTask_IdAndDeletedAtIsNull(task.getId());
            reports.forEach(r -> r.setDeletedAt(now));
            diseaseReportRepository.saveAll(reports);

            // Soft delete task
            task.setDeletedAt(now);
        }
        taskRepository.saveAll(tasks);

        // Soft delete stage
        stage.setDeletedAt(now);
        planStageRepository.save(stage);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private PlanEntity getPlanOrThrow(UUID planId, UUID farmId) {
        return planRepository
                .findByIdAndFarm_IdAndDeletedAtIsNull(planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));
    }

    private PlanStageEntity getStageOrThrow(UUID stageId, UUID planId) {
        return planStageRepository
                .findByIdAndPlanIdAndDeletedAtIsNull(stageId, planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));
    }

    private void checkPlanNotTerminal(PlanEntity plan) {
        if (PlanStatus.CANCELLED.equals(plan.getStatus())
                || PlanStatus.COMPLETED.equals(plan.getStatus())
                || PlanStatus.DRAFT.equals(plan.getStatus())) {
            throw new AppException(ErrorCode.PLAN_IS_TERMINAL);
        }
    }

    private void checkDatesWithinPlan(PlanEntity plan,
                                      LocalDate startDate,
                                      LocalDate endDate) {
        if (startDate.isBefore(plan.getStartDate())
                || endDate.isAfter(plan.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_TIME_MUST_BE_IN_PLAN_TIME);
    }

    private PlanStageStatusEntity getInitialStatus() {
        return planStageStatusRepository
                .findByIsInitialTrue(PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_STATUS_INITIAL_NOT_FOUND));
    }
}
