package com.farmapp.farmsmartmanagement.modules.worklog.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.validation.TaskValidator;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateWorkLogRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogDetailResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogSummaryResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.mapper.WorkLogMapper;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkLogService {

    WarehouseLocationRepository warehouseLocationRepository;
    WorkLogRepository workLogRepository;
    WorkLogMaterialRepository workLogMaterialRepository;
    TaskRepository taskRepository;
    TaskMaterialRepository taskMaterialRepository;
    TaskAssigneeRepository taskAssigneeRepository;
    TaskSkipDayRepository taskSkipDayRepository;
    WarehouseItemRepository warehouseItemRepository;
    WarehouseStockRepository warehouseStockRepository;
    WarehouseTransactionRepository warehouseTransactionRepository;
    WorkShiftRepository workShiftRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    SecurityUtils securityUtils;
    WorkLogMapper workLogMapper;
    EntityManager entityManager;
    TaskValidator taskValidator;

    // ─────────────────────────────────────────────────────────────────────────
    // GET — danh sách theo task
    // GET /plans/{planId}/stages/{stageId}/tasks/{taskId}/worklogs
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByTask(UUID taskId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        return workLogRepository.findAllByTask_IdAndDeletedAtIsNullOrderByWorkDateDesc(taskId)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — danh sách theo plan (dùng cho AttendanceManagement)
    // GET /plans/{planId}/worklogs?from=&to=
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByPlan(UUID planId, LocalDate from, LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from != null && to != null && from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        return workLogRepository
                .findAllByPlanIdAndFarmId(planId, farmId, from, to)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — danh sách theo employee
    // GET /worklogs/employee/{employeeId}?from=&to=
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByEmployee(UUID employeeId,
                                                       LocalDate from,
                                                       LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from != null && to != null && from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        return workLogRepository
                .findAllByEmployee_IdAndFarm_IdAndWorkDateBetweenAndDeletedAtIsNullOrderByWorkDateDesc(
                        employeeId, farmId, from, to)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — danh sách toàn farm
    // GET /worklogs?from=&to=
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByFarm(LocalDate from, LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from != null && to != null && from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        return workLogRepository
                .findAllByFarm_IdAndWorkDateBetweenAndDeletedAtIsNullOrderByWorkDateDesc(
                        farmId, from, to)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — chi tiết 1 worklog
    // GET /tasks/{taskId}/worklogs/{workLogId}
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public WorkLogDetailResponse getWorkLogDetail(UUID workLogId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        WorkLogEntity workLog = workLogRepository.findByIdWithDetails(workLogId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_LOG_NOT_FOUND));

        if (!workLog.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (workLog.getDeletedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_NOT_FOUND);

        return workLogMapper.toDetailResponse(workLog);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — tổng hợp công theo employee (dùng tính lương)
    // GET /worklogs/summary?from=&to=
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogSummaryResponse> getWorkLogSummary(LocalDate from, LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from == null || to == null)
            throw new AppException(ErrorCode.DATE_RANGE_REQUIRED);

        if (from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        if (from.plusMonths(3).isBefore(to))
            throw new AppException(ErrorCode.DATE_RANGE_TOO_LARGE);

        return workLogRepository.summarizeByEmployee(farmId, from, to);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST — tạo worklog (cấp trên chấm công thủ công cho nhân công)
    // POST /plans/{planId}/stages/{stageId}/tasks/{taskId}/worklogs
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public WorkLogResponse createWorkLog(UUID taskId, UUID planStageId, UUID planId,
                                         CreateWorkLogRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity employee = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        TaskEntity task = validateAndGetTask(taskId, planStageId, planId, userId, farmId, request);

        WorkShiftEntity shift = null;
        if (request.getShiftId() != null) {
            shift = workShiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));

            if (!shift.getFarm().getId().equals(farmId))
                throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Tạo worklog — KHÔNG lock ngay, để cấp trên review rồi mới lock
        WorkLogEntity workLog = WorkLogEntity.builder()
                .task(task)
                .farm(farm)
                .employee(employee)
                .workDate(request.getWorkDate())
                .shift(shift)
                .type(request.getType())
                .isOvertime(request.isOvertime())
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .build();

        workLog = workLogRepository.save(workLog);

        // Xử lý vật tư
        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            workLog = processMaterials(workLog, request, farm, task, employee);
        }

        return workLogMapper.toResponse(workLog);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH — lock worklog (cấp trên duyệt, khoá lại để tính lương)
    // PATCH /worklogs/{workLogId}/lock
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public WorkLogResponse lockWorkLog(UUID workLogId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        WorkLogEntity workLog = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_LOG_NOT_FOUND));

        if (!workLog.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (workLog.getDeletedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_NOT_FOUND);

        if (workLog.getLockedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_ALREADY_LOCKED);

        workLog.setLockedAt(Instant.now());

        return workLogMapper.toResponse(workLogRepository.save(workLog));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH — unlock worklog (cấp trên mở khoá để chỉnh sửa)
    // PATCH /worklogs/{workLogId}/unlock
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public WorkLogResponse unlockWorkLog(UUID workLogId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        WorkLogEntity workLog = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_LOG_NOT_FOUND));

        if (!workLog.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (workLog.getDeletedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_NOT_FOUND);

        if (workLog.getLockedAt() == null)
            throw new AppException(ErrorCode.WORK_LOG_NOT_LOCKED);

        workLog.setLockedAt(null);

        return workLogMapper.toResponse(workLogRepository.save(workLog));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE — soft delete worklog
    // DELETE /tasks/{taskId}/worklogs/{workLogId}
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void deleteWorkLog(UUID taskId, UUID workLogId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        WorkLogEntity workLog = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_LOG_NOT_FOUND));

        if (!workLog.getTask().getId().equals(taskId))
            throw new AppException(ErrorCode.WORK_LOG_NOT_FOUND);

        if (!workLog.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (workLog.getDeletedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_NOT_FOUND);

        if (workLog.getLockedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_ALREADY_LOCKED);

        // Soft delete — giữ lại để audit
        workLog.setDeletedAt(Instant.now());
        workLogRepository.save(workLog);

        log.info("[WorkLog] Soft deleted workLogId={} by farmId={}", workLogId, farmId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private TaskEntity validateAndGetTask(UUID taskId, UUID planStageId, UUID planId,
                                          UUID employeeId, UUID farmId,
                                          CreateWorkLogRequest request) {
        TaskEntity task = taskValidator.validateAndGetTask(taskId, planStageId, planId, farmId);

        if (!task.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (!taskAssigneeRepository.existsByTask_IdAndUser_IdAndRemovedAtIsNull(taskId, employeeId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (request.getWorkDate().isAfter(LocalDate.now()))
            throw new AppException(ErrorCode.WORK_DATE_CANNOT_BE_FUTURE);

        if (taskSkipDayRepository.existsByTask_IdAndSkipDate(taskId, request.getWorkDate()))
            throw new AppException(ErrorCode.WORK_DATE_IS_SKIP_DAY);

        if (workLogRepository.existsByTask_IdAndEmployee_IdAndWorkDateAndShift_IdAndDeletedAtIsNull(
                taskId, employeeId, request.getWorkDate(), request.getShiftId()))
            throw new AppException(ErrorCode.WORK_LOG_ALREADY_EXISTS);

        if (task.getStartDate() != null && request.getWorkDate().isBefore(task.getStartDate()))
            throw new AppException(ErrorCode.WORK_DATE_OUT_OF_TASK_RANGE);

        if (task.getEndDate() != null && request.getWorkDate().isAfter(task.getEndDate()))
            throw new AppException(ErrorCode.WORK_DATE_OUT_OF_TASK_RANGE);

        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            validateMaterials(taskId, request);
        }

        return task;
    }

    private void validateMaterials(UUID taskId, CreateWorkLogRequest request) {
        for (var material : request.getMaterials()) {

            if (!taskMaterialRepository.existsByTask_IdAndWarehouseItem_Id(
                    taskId, material.getWarehouseItemId()))
                throw new AppException(ErrorCode.TASK_MATERIAL_NOT_FOUND);

            WarehouseLocationEntity location = warehouseLocationRepository
                    .findById(material.getFromLocationId())
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

            WarehouseItemEntity item = warehouseItemRepository
                    .findById(material.getWarehouseItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

            if (!location.getWarehouse().getId().equals(item.getWarehouse().getId()))
                throw new AppException(ErrorCode.LOCATION_NOT_IN_SAME_WAREHOUSE);

            BigDecimal stockAtLocation = warehouseStockRepository
                    .findQtyByWarehouseItemIdAndLocationId(
                            material.getWarehouseItemId(),
                            material.getFromLocationId());

            if (stockAtLocation == null || stockAtLocation.compareTo(material.getUsedQty()) < 0)
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
    }

    private WorkLogEntity processMaterials(WorkLogEntity workLog, CreateWorkLogRequest request,
                                           FarmEntity farm, TaskEntity task, UserEntity employee) {
        for (var material : request.getMaterials()) {

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

        return workLog;
    }
}