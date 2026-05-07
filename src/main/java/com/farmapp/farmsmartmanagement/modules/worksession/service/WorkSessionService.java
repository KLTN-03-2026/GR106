package com.farmapp.farmsmartmanagement.modules.worksession.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.ForceActionType;
import com.farmapp.farmsmartmanagement.domain.enums.ForceTargetType;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.validation.TaskValidator;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.request.*;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.response.WorkSessionResponse;
import com.farmapp.farmsmartmanagement.modules.worksession.mapper.WorkSessionMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkSessionService {

    WorkSessionRepository workSessionRepository;
    WorkSessionPolicyRepository workSessionPolicyRepository;
    ForceActionLogRepository forceActionLogRepository;
    TaskRepository taskRepository;
    TaskAssigneeRepository taskAssigneeRepository;
    WorkShiftRepository workShiftRepository;
    WorkLogRepository workLogRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    SecurityUtils securityUtils;
    WorkSessionMapper workSessionMapper;
    TaskValidator taskValidator;

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK-IN
    // POST /plans/{planId}/stages/{stageId}/tasks/{taskId}/sessions/check-in
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public WorkSessionResponse checkIn(UUID taskId, UUID planStageId, UUID planId, CheckInRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        TaskEntity task = taskValidator.validateAndGetTask(taskId, planStageId, planId, farmId);

        // Phải là assignee của task
        if (!taskAssigneeRepository.existsByTask_IdAndUser_IdAndRemovedAtIsNull(taskId, userId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // Không được check-in 2 lần (unique index đã enforce, nhưng check trước để báo lỗi rõ)
        if (workSessionRepository.findByEmployee_IdAndCheckedOutAtIsNull(userId).isPresent())
            throw new AppException(ErrorCode.SESSION_ALREADY_OPEN);

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity employee = userRepository.getReferenceById(userId);

        WorkSessionEntity session = WorkSessionEntity.builder()
                .task(task)
                .farm(farm)
                .employee(employee)
                .checkedInAt(Instant.now())
                .checkInNote(request.getCheckInNote())
                .build();

        return workSessionMapper.toResponse(workSessionRepository.save(session));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK-OUT
    // POST /sessions/{sessionId}/check-out
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public WorkSessionResponse checkOut(UUID sessionId, CheckOutRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        WorkSessionEntity session = getOpenSessionOrThrow(sessionId, userId, farmId);

        WorkShiftEntity shift = workShiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));

        if (!shift.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // Đóng session
        session.setCheckedOutAt(Instant.now());
        session.setCheckOutNote(request.getCheckOutNote());

        // Tạo work_log từ session
        WorkLogEntity workLog = WorkLogEntity.builder()
                .task(session.getTask())
                .farm(session.getFarm())
                .employee(session.getEmployee())
                .workDate(session.getCheckedInAt()
                        .atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
                        .toLocalDate())
                .shift(shift)
                .type(com.farmapp.farmsmartmanagement.domain.enums.WorkLogType.NORMAL)
                .isOvertime(false)
                .createdAt(Instant.now())
                .build();

        workLog = workLogRepository.save(workLog);

        // Gắn work_log vào session
        session.setWorkLog(workLog);

        return workSessionMapper.toResponse(workSessionRepository.save(session));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADJUST CHECKOUT (nhân công quên check-out, sửa lại giờ)
    // PATCH /sessions/{sessionId}/adjust-checkout
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public WorkSessionResponse adjustCheckout(UUID sessionId, AdjustCheckoutRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        // Kiểm tra policy có cho phép manual checkout không
        workSessionPolicyRepository.findByFarm_Id(farmId).ifPresent(policy -> {
            if (!policy.isAllowManualCheckout())
                throw new AppException(ErrorCode.MANUAL_CHECKOUT_NOT_ALLOWED);
        });

        WorkSessionEntity session = workSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        // Chỉ chính nhân công hoặc cấp trên mới được sửa
        boolean isSelf = session.getEmployee().getId().equals(userId);
        // TODO: thêm check role cấp trên nếu cần
        if (!isSelf)
            throw new AppException(ErrorCode.FORBIDDEN);

        // Giờ sửa phải sau giờ check-in
        if (!request.getActualCheckoutAt().isAfter(session.getCheckedInAt()))
            throw new AppException(ErrorCode.INVALID_CHECKOUT_TIME);

        // Lưu giá trị cũ trước khi sửa
        session.setCheckedOutAtOriginal(session.getCheckedOutAt());
        session.setCheckedOutAt(request.getActualCheckoutAt());
        session.setAdjustedBy(userRepository.getReferenceById(userId));
        session.setAdjustedAt(Instant.now());
        session.setAdjustReason(request.getAdjustReason());

        return workSessionMapper.toResponse(workSessionRepository.save(session));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FORCE CLOSE — cấp trên khoá task/stage/plan
    // Gọi từ TaskService / PlanStageService khi đổi status terminal
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public ForceActionLogEntity forceCloseByTask(UUID taskId, String reason,
                                                 ForceActionType action, UUID performedBy) {
        List<WorkSessionEntity> openSessions =
                workSessionRepository.findAllByTask_IdAndCheckedOutAtIsNull(taskId);

        return forceCloseSessions(openSessions, ForceTargetType.TASK, taskId,
                action, reason, performedBy);
    }

    @Transactional
    public ForceActionLogEntity forceCloseByStage(UUID stageId, String reason,
                                                  ForceActionType action, UUID performedBy) {
        List<WorkSessionEntity> openSessions =
                workSessionRepository.findOpenSessionsByStageId(stageId);

        return forceCloseSessions(openSessions, ForceTargetType.STAGE, stageId,
                action, reason, performedBy);
    }

    @Transactional
    public ForceActionLogEntity forceCloseByPlan(UUID planId, String reason,
                                                 ForceActionType action, UUID performedBy) {
        List<WorkSessionEntity> openSessions =
                workSessionRepository.findOpenSessionsByPlanId(planId);

        return forceCloseSessions(openSessions, ForceTargetType.PLAN, planId,
                action, reason, performedBy);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — session đang mở của employee hiện tại
    // GET /sessions/me/current
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public WorkSessionResponse getCurrentSession() {
        UUID userId = securityUtils.getCurrentUserId();
        UUID farmId = securityUtils.getCurrentFarmId();

        return workSessionRepository.findByEmployee_IdAndCheckedOutAtIsNull(userId)
                .filter(s -> s.getFarm().getId().equals(farmId))
                .map(workSessionMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — tất cả session đang mở của farm (cho dashboard cấp trên)
    // GET /sessions/open
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkSessionResponse> getOpenSessions() {
        UUID farmId = securityUtils.getCurrentFarmId();
        return workSessionRepository.findAllByFarm_IdAndCheckedOutAtIsNull(farmId)
                .stream()
                .map(workSessionMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET — lịch sử session của task
    // GET /tasks/{taskId}/sessions
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<WorkSessionResponse> getSessionsByTask(UUID taskId) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        return workSessionRepository
                .findAllByTask_IdAndEmployee_IdOrderByCheckedInAtDesc(taskId, userId)
                .stream()
                .map(workSessionMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private WorkSessionEntity getOpenSessionOrThrow(UUID sessionId, UUID userId, UUID farmId) {
        WorkSessionEntity session = workSessionRepository
                .findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (!session.getEmployee().getId().equals(userId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (!session.isOpen())
            throw new AppException(ErrorCode.SESSION_ALREADY_CLOSED);

        return session;
    }

    private ForceActionLogEntity forceCloseSessions(List<WorkSessionEntity> openSessions,
                                                    ForceTargetType targetType,
                                                    UUID targetId,
                                                    ForceActionType action,
                                                    String reason,
                                                    UUID performedBy) {
        if (openSessions.isEmpty()) return null;

        FarmEntity farm = openSessions.get(0).getFarm();
        UserEntity performer = userRepository.getReferenceById(performedBy);

        // Tạo force_action_log
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

        // Force-close tất cả session đang mở
        Instant now = Instant.now();
        for (WorkSessionEntity session : openSessions) {
            session.setCheckedOutAt(now);
            session.setForceActionLog(forceLog);
        }
        workSessionRepository.saveAll(openSessions);

        log.warn("[ForceClose] {} {} — {} sessions bị đóng bởi {}",
                targetType, targetId, openSessions.size(), performedBy);

        return forceLog;
    }
}