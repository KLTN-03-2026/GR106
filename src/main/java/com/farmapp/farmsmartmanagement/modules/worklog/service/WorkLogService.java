package com.farmapp.farmsmartmanagement.modules.worklog.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
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


    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByTask(UUID taskId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Kiểm tra task thuộc farm
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        return workLogRepository.findAllByTask_IdOrderByWorkDateDesc(taskId)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
// Xem chấm công của 1 employee trong 1 khoảng thời gian
// GET /work-logs/employee?from=2026-01-01&to=2026-01-31
// ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByEmployee(UUID employeeId,
                                                       LocalDate from,
                                                       LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from != null && to != null && from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        return workLogRepository
                .findAllByEmployee_IdAndFarm_IdAndWorkDateBetweenOrderByWorkDateDesc(
                        employeeId, farmId, from, to)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
// Xem chấm công của toàn farm trong 1 khoảng thời gian
// GET /work-logs?from=2026-01-01&to=2026-01-31
// ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogResponse> getWorkLogsByFarm(LocalDate from, LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from != null && to != null && from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        return workLogRepository
                .findAllByFarm_IdAndWorkDateBetweenOrderByWorkDateDesc(farmId, from, to)
                .stream()
                .map(workLogMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
// Xem chi tiết 1 work log — bao gồm vật tư đã dùng
// GET /work-logs/{workLogId}
// ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public WorkLogDetailResponse getWorkLogDetail(UUID workLogId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        WorkLogEntity workLog = workLogRepository.findByIdWithDetails(workLogId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_LOG_NOT_FOUND));

        if (!workLog.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        return workLogMapper.toDetailResponse(workLog);
    }

    // ─────────────────────────────────────────────────────────────────────────
// Tổng hợp công theo employee trong khoảng thời gian — dùng cho tính lương
// GET /work-logs/summary?from=2026-01-01&to=2026-01-31
// ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkLogSummaryResponse> getWorkLogSummary(LocalDate from, LocalDate to) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if (from == null || to == null)
            throw new AppException(ErrorCode.DATE_RANGE_REQUIRED);

        if (from.isAfter(to))
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);

        // Giới hạn tối đa 3 tháng để tránh query nặng
        if (from.plusMonths(3).isBefore(to))
            throw new AppException(ErrorCode.DATE_RANGE_TOO_LARGE);

        return workLogRepository.summarizeByEmployee(farmId, from, to);
    }

    @Transactional
    public WorkLogResponse createWorkLog(UUID taskId, CreateWorkLogRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity employee = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Validate và lấy task — validate vật tư ở đây luôn
        TaskEntity task = validateAndGetTask(taskId, userId, farmId, request);

        // Validate shift nếu có
        WorkShiftEntity shift = null;
        if (request.getShiftId() != null) {
            shift = workShiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));

            if (!shift.getFarm().getId().equals(farmId))
                throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Tạo work log
        WorkLogEntity workLog = WorkLogEntity.builder()
                .task(task)
                .farm(farm)
                .employee(employee)
                .workDate(request.getWorkDate())
                .shift(shift)
                .type(request.getType())
                .isOvertime(request.isOvertime())
                .lockedAt(Instant.now()) // Khoá lại luôn
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .build();

        workLog = workLogRepository.save(workLog);

        // Xử lý vật tư nếu có
        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            for (var material : request.getMaterials()) {

                WarehouseItemEntity warehouseItem = warehouseItemRepository
                        .findById(material.getWarehouseItemId())
                        .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

                WarehouseLocationEntity fromLocation = warehouseLocationRepository
                        .findById(material.getFromLocationId())
                        .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

                // Ghi work log material
                WorkLogMaterialEntity workLogMaterial = WorkLogMaterialEntity.builder()
                        .workLog(workLog)
                        .warehouseItem(warehouseItem)
                        .usedQty(material.getUsedQty())
                        .deviationReason(material.getDeviationReason())
                        .build();
                workLogMaterialRepository.save(workLogMaterial);

                // Tạo warehouse transaction → trigger fn_update_stock tự trừ kho
                WarehouseTransactionEntity transaction = WarehouseTransactionEntity.builder()
                        .farm(farm)
                        .warehouse(warehouseItem.getWarehouse())
                        .warehouseItem(warehouseItem)
                        .fromLocation(fromLocation) // EXPORT_TASK cần from_location_id
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

        return workLogMapper.toResponse(workLog);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Validate — chỉ validate, không tạo entity
    // ─────────────────────────────────────────────────────────────────────────
    private TaskEntity validateAndGetTask(UUID taskId, UUID employeeId,
                                          UUID farmId, CreateWorkLogRequest request) {

        // 1. Task tồn tại
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // 2. Task thuộc farm hiện tại
        if (!task.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // 3. Task chưa ở trạng thái terminal
        if (task.getStatus().getIsTerminal())
            throw new AppException(ErrorCode.TASK_IS_TERMINAL);

        // 4. Employee được assign vào task và chưa bị remove
        if (!taskAssigneeRepository.existsByTask_IdAndUser_IdAndRemovedAtIsNull(taskId, employeeId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // 5. Ngày làm việc không phải tương lai
        if (request.getWorkDate().isAfter(LocalDate.now()))
            throw new AppException(ErrorCode.WORK_DATE_CANNOT_BE_FUTURE);

        // 6. Ngày không phải skip day của task
        if (taskSkipDayRepository.existsByTask_IdAndSkipDate(taskId, request.getWorkDate()))
            throw new AppException(ErrorCode.WORK_DATE_IS_SKIP_DAY);

        // 7. Không trùng log (task + employee + date + shift)
        if (workLogRepository.existsByTask_IdAndEmployee_IdAndWorkDateAndShift_Id(
                taskId, employeeId, request.getWorkDate(), request.getShiftId()))
            throw new AppException(ErrorCode.WORK_LOG_ALREADY_EXISTS);

        // 8. Ngày trong khoảng thời gian task
        if (task.getStartDate() != null
                && request.getWorkDate().isBefore(task.getStartDate()))
            throw new AppException(ErrorCode.WORK_DATE_OUT_OF_TASK_RANGE);

        if (task.getEndDate() != null
                && request.getWorkDate().isAfter(task.getEndDate()))
            throw new AppException(ErrorCode.WORK_DATE_OUT_OF_TASK_RANGE);

        // 9. Validate từng vật tư
        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            for (var material : request.getMaterials()) {

                // Vật tư phải có trong task_materials của task này
                if (!taskMaterialRepository.existsByTask_IdAndWarehouseItem_Id(
                        taskId, material.getWarehouseItemId()))
                    throw new AppException(ErrorCode.TASK_MATERIAL_NOT_FOUND);

                // Location phải tồn tại
                WarehouseLocationEntity location = warehouseLocationRepository
                        .findById(material.getFromLocationId())
                        .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_LOCATION_NOT_FOUND));

                // Location phải thuộc cùng warehouse với item
                WarehouseItemEntity item = warehouseItemRepository
                        .findById(material.getWarehouseItemId())
                        .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

                if (!location.getWarehouse().getId().equals(item.getWarehouse().getId()))
                    throw new AppException(ErrorCode.LOCATION_NOT_IN_SAME_WAREHOUSE);

                // Tồn kho tại location đó phải đủ
                BigDecimal stockAtLocation = warehouseStockRepository
                        .findQtyByWarehouseItemIdAndLocationId(
                                material.getWarehouseItemId(),
                                material.getFromLocationId());

                if (stockAtLocation == null
                        || stockAtLocation.compareTo(material.getUsedQty()) < 0)
                    throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
        }

        return task;
    }

    @Transactional
    public void deleteWorkLog(UUID taskId, UUID workLogId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        WorkLogEntity workLog = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_LOG_NOT_FOUND));

        // Kiểm tra thuộc đúng task và farm
        if (!workLog.getTask().getId().equals(taskId))
            throw new AppException(ErrorCode.WORK_LOG_NOT_FOUND);

        if (!workLog.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // Không xóa được khi đã lock (đã tính lương)
        if (workLog.getLockedAt() != null)
            throw new AppException(ErrorCode.WORK_LOG_ALREADY_LOCKED);

        // Xóa work log materials trước
        workLogMaterialRepository.deleteAllByWorkLog_Id(workLogId);

        // Xóa warehouse transactions liên quan
        warehouseTransactionRepository.deleteAllByRefWorkLog_Id(workLogId);

        workLogRepository.delete(workLog);
    }
}