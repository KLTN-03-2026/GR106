package com.farmapp.farmsmartmanagement.modules.worksession.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.ForceActionType;
import com.farmapp.farmsmartmanagement.domain.enums.ForceTargetType;
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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    WorkShiftRepository workShiftRepository;
    WorkLogRepository workLogRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    SecurityUtils securityUtils;
    WorkSessionMapper workSessionMapper;
    TaskValidator taskValidator;

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK-IN
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public WorkSessionResponse checkIn(UUID taskId, CheckInRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        Instant now = Instant.now();

        // validate task active
        TaskEntity task = taskValidator.validateAndGetTaskById(taskId,farmId);


        // assignee ?
        boolean assigned =
                taskAssigneeRepository
                        .existsByTask_IdAndUser_IdAndRemovedAtIsNull(taskId, userId);

        if (!assigned) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // response đẹp hơn
        if (workSessionRepository.existsByEmployee_IdAndCheckedOutAtIsNull(userId)) {
            throw new AppException(ErrorCode.SESSION_ALREADY_OPEN);
        }

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity employee = userRepository.getReferenceById(userId);

        // create session first
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

            // unique partial index:
            // employee_id where checked_out_at is null
            log.info("Work Session already exists");
            throw new AppException(ErrorCode.SESSION_ALREADY_OPEN);
        }

        // create worklog after session success
        WorkLogEntity workLog = WorkLogEntity.builder()
                .task(task)
                .farm(farm)
                .employee(employee)
                .workDate(LocalDate.now(VIETNAM_ZONE))
                .type(WorkLogType.NORMAL)
                .status(WorkLogStatus.WORKING)
                .isOvertime(false)
                .createdAt(now)
                .build();

        workLog = workLogRepository.save(workLog);

        // attach worklog
        session.setWorkLog(workLog);

        return workSessionMapper.toResponse(
                workSessionRepository.save(session)
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK-OUT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public WorkSessionResponse checkOut(UUID sessionId, CheckOutRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        WorkSessionEntity session = getOpenSessionForUpdateOrThrow(sessionId, userId, farmId);

        WorkShiftEntity shift = null;
        if(request.getShiftId() != null) {
            workShiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));

            if (!shift.getFarm().getId().equals(farmId)) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }

        Instant now = Instant.now();

        // close session
        session.setCheckedOutAt(now);
        session.setCheckOutNote(request.getCheckOutNote());

        // finalize work log
        WorkLogEntity workLog = session.getWorkLog();

        workLog.setShift(shift);
        workLog.setStatus(WorkLogStatus.COMPLETED);

        workLogRepository.save(workLog);

        return workSessionMapper.toResponse(
                workSessionRepository.save(session)
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADJUST CHECKOUT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public WorkSessionResponse adjustCheckout(UUID sessionId,
                                              AdjustCheckoutRequest request) {

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

        return workSessionMapper.toResponse(
                workSessionRepository.save(session)
        );
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

        return forceCloseSessions(
                openSessions,
                ForceTargetType.TASK,
                taskId,
                action,
                reason,
                performedBy
        );
    }

    @Transactional
    public ForceActionLogEntity forceCloseByStage(UUID stageId,
                                                  String reason,
                                                  ForceActionType action,
                                                  UUID performedBy) {

        List<WorkSessionEntity> openSessions =
                workSessionRepository.findOpenSessionsByStageId(stageId);

        return forceCloseSessions(
                openSessions,
                ForceTargetType.STAGE,
                stageId,
                action,
                reason,
                performedBy
        );
    }

    @Transactional
    public ForceActionLogEntity forceCloseByPlan(UUID planId,
                                                 String reason,
                                                 ForceActionType action,
                                                 UUID performedBy) {

        List<WorkSessionEntity> openSessions =
                workSessionRepository.findOpenSessionsByPlanId(planId);

        return forceCloseSessions(
                openSessions,
                ForceTargetType.PLAN,
                planId,
                action,
                reason,
                performedBy
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET CURRENT SESSION
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

    // ─────────────────────────────────────────────────────────────────────────
    // GET OPEN SESSIONS
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<WorkSessionResponse> getOpenSessions() {

        UUID farmId = securityUtils.getCurrentFarmId();

        return workSessionRepository
                .findAllByFarm_IdAndCheckedOutAtIsNull(farmId)
                .stream()
                .map(workSessionMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET TASK SESSION HISTORY
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<WorkSessionResponse> getSessionsByTask(UUID taskId) {

        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return workSessionRepository
                .findAllByTask_IdAndEmployee_IdOrderByCheckedInAtDesc(taskId, userId)
                .stream()
                .map(workSessionMapper::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private WorkSessionEntity getOpenSessionForUpdateOrThrow(UUID sessionId,
                                                             UUID userId,
                                                             UUID farmId) {

        WorkSessionEntity session = workSessionRepository
                .findByIdForUpdate(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (!session.getEmployee().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (!session.isOpen()) {
            throw new AppException(ErrorCode.SESSION_ALREADY_CLOSED);
        }

        return session;
    }

    private ForceActionLogEntity forceCloseSessions(
            List<WorkSessionEntity> openSessions,
            ForceTargetType targetType,
            UUID targetId,
            ForceActionType action,
            String reason,
            UUID performedBy
    ) {

        if (openSessions.isEmpty()) {
            return null;
        }

        FarmEntity farm = openSessions.get(0).getFarm();

        UserEntity performer =
                userRepository.getReferenceById(performedBy);

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

                session.getWorkLog()
                        .setStatus(WorkLogStatus.FORCE_CLOSED);
            }
        }

        workSessionRepository.saveAll(openSessions);

        log.warn(
                "[ForceClose] {} {} — {} sessions bị đóng bởi {}",
                targetType,
                targetId,
                openSessions.size(),
                performedBy
        );

        return forceLog;
    }
}