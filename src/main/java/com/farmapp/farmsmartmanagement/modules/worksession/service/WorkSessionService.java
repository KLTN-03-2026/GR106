package com.farmapp.farmsmartmanagement.modules.worksession.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.response.PageableResponse;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.ForceActionType;
import com.farmapp.farmsmartmanagement.domain.enums.ForceTargetType;
import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
import com.farmapp.farmsmartmanagement.domain.enums.WorkLogStatus;
import com.farmapp.farmsmartmanagement.domain.enums.WorkLogType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.validation.TaskValidator;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.request.AdjustCheckoutRequest;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.request.CheckInRequest;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.request.CheckOutRequest;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.response.WorkSessionResponse;
import com.farmapp.farmsmartmanagement.modules.worksession.mapper.WorkSessionMapper;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkSessionService {

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    WorkSessionRepository workSessionRepository;
    WorkSessionPolicyRepository workSessionPolicyRepository;
    ForceActionLogRepository forceActionLogRepository;
    TaskRepository taskRepository;
    TaskAssigneeRepository taskAssigneeRepository;
    TaskMaterialRepository taskMaterialRepository;
    WorkShiftRepository workShiftRepository;
    WorkLogRepository workLogRepository;
    WorkLogMaterialRepository workLogMaterialRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    WarehouseItemRepository warehouseItemRepository;
    WarehouseLocationRepository warehouseLocationRepository;
    WarehouseStockRepository warehouseStockRepository;
    WarehouseTransactionRepository warehouseTransactionRepository;
    FarmConfigRepository farmConfigRepository;
    SecurityUtils securityUtils;
    WorkSessionMapper workSessionMapper;
    TaskValidator taskValidator;
    EntityManager entityManager;

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK-IN
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public WorkSessionResponse checkIn(UUID taskId, CheckInRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();
        Instant now = Instant.now();

        TaskEntity task = taskValidator.validateAndGetTaskById(taskId, farmId);

        boolean assigned =
                taskAssigneeRepository.existsByTask_IdAndUser_IdAndRemovedAtIsNull(taskId, userId);
        if (!assigned) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (workSessionRepository.existsByEmployee_IdAndCheckedOutAtIsNull(userId)) {
            throw new AppException(ErrorCode.SESSION_ALREADY_OPEN);
        }

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity employee = userRepository.getReferenceById(userId);

        WorkSessionEntity session = WorkSessionEntity.builder()
                .task(task)
                .farm(farm)
                .employee(employee)
                .checkedInAt(now)
                .checkInNote(request.getCheckInNote())
                .createdAt(now)
                .build();

        try {
            session = workSessionRepository.saveAndFlush(session);
        } catch (DataIntegrityViolationException ex) {
            log.info("Work Session already exists for userId={}", userId);
            throw new AppException(ErrorCode.SESSION_ALREADY_OPEN);
        }

        FarmConfigEntity farmConfig = farmConfigRepository
                .findByFarmId(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_CONFIG_NOT_FOUND));

        // Tạo worklog tạm (WORKING) — sẽ được hoàn thiện khi checkout
        WorkLogEntity workLog = WorkLogEntity.builder()
                .task(task)
                .farm(farm)
                .employee(employee)
                .workDate(LocalDate.now(ZoneId.of(farmConfig.getTimezone())))
                .type(WorkLogType.NORMAL)
                .status(WorkLogStatus.WORKING)
                .isOvertime(false)
                .createdAt(now)
                .build();

        workLog = workLogRepository.save(workLog);

        session.setWorkLog(workLog);

        return workSessionMapper.toResponse(workSessionRepository.save(session));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK-OUT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public WorkSessionResponse checkOut(UUID sessionId, CheckOutRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        WorkSessionEntity session = getOpenSessionForUpdateOrThrow(sessionId, userId, farmId);
        TaskEntity task = session.getTask();
        UserEntity employee = session.getEmployee();
        FarmEntity farm = session.getFarm();
        Instant now = Instant.now();

        // ── Resolve shift ──────────────────────────────────────────────────
        WorkShiftEntity shift = null;
        if (request.getShiftId() != null) {
            shift = workShiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));
            if (!shift.getFarm().getId().equals(farmId)) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }

        // ── Validate materials trước khi thay đổi bất kỳ dữ liệu nào ──────
        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            validateMaterials(task.getId(), farmId, request.getMaterials());
        }

        // ── Close session ─────────────────────────────────────────────────
        session.setCheckedOutAt(now);
        session.setCheckOutNote(request.getCheckOutNote());

        // ── Finalize WorkLog ──────────────────────────────────────────────
        WorkLogEntity workLog = session.getWorkLog();
        workLog.setShift(shift);
        workLog.setType(request.getType());
        workLog.setOvertime(request.isOvertime());
        workLog.setNotes(request.getNotes());
        workLog.setStatus(WorkLogStatus.COMPLETED);
        workLogRepository.save(workLog);

        // ── Xử lý vật tư ─────────────────────────────────────────────────
        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            processMaterials(workLog, request.getMaterials(), farm, task, employee);
        }

        return workSessionMapper.toResponse(workSessionRepository.save(session));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADJUST CHECKOUT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public WorkSessionResponse adjustCheckout(UUID sessionId, AdjustCheckoutRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        workSessionPolicyRepository.findByFarm_Id(farmId).ifPresent(policy -> {
            if (!policy.isAllowManualCheckout()) {
                throw new AppException(ErrorCode.MANUAL_CHECKOUT_NOT_ALLOWED);
            }
        });

        WorkSessionEntity session = workSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        boolean isSelf = session.getEmployee().getId().equals(userId);

        // TODO: check manager permission
        if (!isSelf) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (!request.getActualCheckoutAt().isAfter(session.getCheckedInAt())) {
            throw new AppException(ErrorCode.INVALID_CHECKOUT_TIME);
        }

        session.setCheckedOutAtOriginal(session.getCheckedOutAt());
        session.setCheckedOutAt(request.getActualCheckoutAt());
        session.setAdjustedBy(userRepository.getReferenceById(userId));
        session.setAdjustedAt(Instant.now());
        session.setAdjustReason(request.getAdjustReason());

        return workSessionMapper.toResponse(workSessionRepository.save(session));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FORCE CLOSE
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public ForceActionLogEntity forceCloseByTask(UUID taskId,
                                                 String reason,
                                                 ForceActionType action,
                                                 UUID performedBy) {
        List<WorkSessionEntity> openSessions =
                workSessionRepository.findAllByTask_IdAndCheckedOutAtIsNull(taskId);
        return forceCloseSessions(openSessions, ForceTargetType.TASK, taskId, action, reason, performedBy);
    }

    @Transactional
    public ForceActionLogEntity forceCloseByStage(UUID stageId,
                                                  String reason,
                                                  ForceActionType action,
                                                  UUID performedBy) {
        List<WorkSessionEntity> openSessions =
                workSessionRepository.findOpenSessionsByStageId(stageId);
        return forceCloseSessions(openSessions, ForceTargetType.STAGE, stageId, action, reason, performedBy);
    }

    @Transactional
    public ForceActionLogEntity forceCloseByPlan(UUID planId,
                                                 String reason,
                                                 ForceActionType action,
                                                 UUID performedBy) {
        List<WorkSessionEntity> openSessions =
                workSessionRepository.findOpenSessionsByPlanId(planId);
        return forceCloseSessions(openSessions, ForceTargetType.PLAN, planId, action, reason, performedBy);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public WorkSessionResponse getCurrentSession() {
        UUID userId = securityUtils.getCurrentUserId();
        UUID farmId = securityUtils.getCurrentFarmId();

        return workSessionRepository
                .findByEmployee_IdAndCheckedOutAtIsNull(userId)
                .filter(s -> s.getFarm().getId().equals(farmId))
                .map(workSessionMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public PageableResponse<WorkSessionResponse> getOpenSessions(Pageable pageable) {
        UUID farmId = securityUtils.getCurrentFarmId();
        Page<WorkSessionResponse> page = workSessionRepository
                .findAllByFarm_IdAndCheckedOutAtIsNull(farmId, pageable)
                .map(workSessionMapper::toResponse);
        return PageableResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageableResponse<WorkSessionResponse> getSessionsByTask(UUID taskId, Pageable pageable) {
        UUID farmId = securityUtils.getCurrentFarmId();

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
        if (!task.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        Page<WorkSessionResponse> page = workSessionRepository
                .findAllByTask_IdOrderByCheckedInAtDesc(taskId, pageable)
                .map(workSessionMapper::toResponse);
        return PageableResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageableResponse<WorkSessionResponse> getSessionsByTaskAndMe(UUID taskId, Pageable pageable) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
        if (!task.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        Page<WorkSessionResponse> page = workSessionRepository
                .findAllByTask_IdAndEmployee_IdOrderByCheckedInAtDesc(taskId, userId, pageable)
                .map(workSessionMapper::toResponse);
        return PageableResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageableResponse<WorkSessionResponse> getSessionsByMe(Pageable pageable) {
        UUID userId = securityUtils.getCurrentUserId();
        Page<WorkSessionResponse> page = workSessionRepository
                .findAllByEmployee_Id(userId, pageable)
                .map(workSessionMapper::toResponse);
        return PageableResponse.of(page);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private WorkSessionEntity getOpenSessionForUpdateOrThrow(UUID sessionId,
                                                             UUID userId,
                                                             UUID farmId) {
        WorkSessionEntity session = workSessionRepository
                .findByIdForUpdate(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);
        if (!session.getEmployee().getId().equals(userId))
            throw new AppException(ErrorCode.FORBIDDEN);
        if (!session.isOpen())
            throw new AppException(ErrorCode.SESSION_ALREADY_CLOSED);

        return session;
    }

    /**
     * Validate toàn bộ danh sách vật tư trước khi ghi bất kỳ row nào.
     * Ném exception ngay nếu có lỗi để tránh partial write.
     */
    private void validateMaterials(UUID taskId,
                                   UUID farmId,
                                   List<CheckOutRequest.WorkLogMaterialRequest> materials) {
        for (var material : materials) {

            if (!taskMaterialRepository.existsByTask_IdAndWarehouseItem_Id(
                    taskId, material.getWarehouseItemId())) {
                throw new AppException(ErrorCode.TASK_MATERIAL_NOT_FOUND);
            }

            WarehouseLocationEntity location = warehouseLocationRepository
                    .findById(material.getFromLocationId())
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

            WarehouseItemEntity item = warehouseItemRepository
                    .findById(material.getWarehouseItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

            if (!location.getWarehouse().getId().equals(item.getWarehouse().getId())) {
                throw new AppException(ErrorCode.LOCATION_NOT_IN_SAME_WAREHOUSE);
            }

            BigDecimal stock = warehouseStockRepository
                    .findQtyByWarehouseItemIdAndLocationId(
                            material.getWarehouseItemId(),
                            material.getFromLocationId());

            if (stock == null || stock.compareTo(material.getUsedQty()) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
        }
    }

    /**
     * Ghi WorkLogMaterial + WarehouseTransaction, rồi flush để
     * trigger fn_update_stock chạy trên DB.
     */
    private void processMaterials(WorkLogEntity workLog,
                                  List<CheckOutRequest.WorkLogMaterialRequest> materials,
                                  FarmEntity farm,
                                  TaskEntity task,
                                  UserEntity employee) {
        for (var material : materials) {

            WarehouseItemEntity warehouseItem = warehouseItemRepository
                    .findById(material.getWarehouseItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

            WarehouseLocationEntity fromLocation = warehouseLocationRepository
                    .findById(material.getFromLocationId())
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

            WorkLogMaterialEntity workLogMaterial = WorkLogMaterialEntity.builder()
                    .workLog(workLog)
                    .warehouseItem(warehouseItem)
                    .usedQty(material.getUsedQty())
                    .deviationReason(material.getDeviationReason())
                    .build();
            workLogMaterialRepository.save(workLogMaterial);

            WarehouseTransactionEntity transaction = WarehouseTransactionEntity.builder()
                    .farm(farm)
                    .warehouse(warehouseItem.getWarehouse())
                    .warehouseItem(warehouseItem)
                    .fromLocation(fromLocation)
                    .toLocation(null)
                    .type(WarehouseTxnType.EXPORT_TASK)
                    .qtyChange(material.getUsedQty())
                    .refWorkLog(workLog)
                    .refTask(task)
                    .performedBy(employee)
                    .notes("Export vật tư cho task: " + task.getName())
                    .build();
            warehouseTransactionRepository.save(transaction);
        }

        // Flush để trigger fn_update_stock chạy trên DB
        entityManager.flush();
    }

    private ForceActionLogEntity forceCloseSessions(
            List<WorkSessionEntity> openSessions,
            ForceTargetType targetType,
            UUID targetId,
            ForceActionType action,
            String reason,
            UUID performedBy) {

        if (openSessions.isEmpty()) return null;

        FarmEntity farm = openSessions.get(0).getFarm();
        UserEntity performer = userRepository.getReferenceById(performedBy);

        ForceActionLogEntity forceLog = ForceActionLogEntity.builder()
                .farm(farm)
                .targetType(targetType)
                .targetId(targetId)
                .action(action)
                .reason(reason)
                .performedBy(performer)
                .performedAt(Instant.now())
                .build();

        forceLog = forceActionLogRepository.save(forceLog);

        Instant now = Instant.now();

        for (WorkSessionEntity session : openSessions) {
            session.setCheckedOutAt(now);
            session.setForceActionLog(forceLog);

            if (session.getWorkLog() != null) {
                session.getWorkLog().setStatus(WorkLogStatus.FORCE_CLOSED);
            }
        }

        workSessionRepository.saveAll(openSessions);

        log.warn("[ForceClose] {} {} — {} sessions bị đóng bởi {}",
                targetType, targetId, openSessions.size(), performedBy);

        return forceLog;
    }
}