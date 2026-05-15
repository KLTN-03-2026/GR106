package com.farmapp.farmsmartmanagement.modules.worklog.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkShiftEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WorkShiftRepository;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateWorkShiftRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.UpdateWorkShiftRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkShiftResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.mapper.WorkShiftMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkShiftService {

    WorkShiftRepository workShiftRepository;
    FarmRepository farmRepository;
    WorkShiftMapper workShiftMapper;
    SecurityUtils securityUtils;

    private static final int MAX_SHIFTS_PER_FARM = 24;

    @Transactional(readOnly = true)
    public List<WorkShiftResponse> getAllWorkShifts() {
        UUID farmId = securityUtils.getCurrentFarmId();
        return workShiftMapper.toResponses(
                workShiftRepository.findAllByFarm_IdOrderByCreatedAtAsc(farmId));
    }

    @Transactional
    public WorkShiftResponse createWorkShift(CreateWorkShiftRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Kiểm tra giới hạn 24 shift
        if (workShiftRepository.countByFarm_Id(farmId) >= MAX_SHIFTS_PER_FARM)
            throw new AppException(ErrorCode.WORK_SHIFT_LIMIT_EXCEEDED);

        // Kiểm tra tên trùng trong farm
        if (workShiftRepository.existsByFarm_IdAndName(farmId, request.getName()))
            throw new AppException(ErrorCode.WORK_SHIFT_NAME_ALREADY_EXISTS);

        FarmEntity farm = farmRepository.getReferenceById(farmId);

        WorkShiftEntity shift = WorkShiftEntity.builder()
                .farm(farm)
                .name(request.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .coefficient(request.getCoefficient())
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        return workShiftMapper.toResponse(workShiftRepository.save(shift));
    }

    @Transactional
    public WorkShiftResponse updateWorkShift(UUID shiftId, UpdateWorkShiftRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Pessimistic lock — tránh race condition
        WorkShiftEntity shift = workShiftRepository
                .findByIdAndFarmIdForUpdate(shiftId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));

        // Không update khi đã được tham chiếu bởi work_log
        if (workShiftRepository.isShiftReferencedByWorkLog(shiftId))
            throw new AppException(ErrorCode.WORK_SHIFT_IN_USE);

        // Kiểm tra tên trùng (trừ chính nó)
        if (request.getName() != null
                && !request.getName().equals(shift.getName())
                && workShiftRepository.existsByFarm_IdAndNameAndIdNot(
                farmId, request.getName(), shiftId))
            throw new AppException(ErrorCode.WORK_SHIFT_NAME_ALREADY_EXISTS);

        // Validate startTime < endTime sau khi merge
        LocalTime newStart = request.getStartTime() != null
                ? request.getStartTime() : shift.getStartTime();
        LocalTime newEnd = request.getEndTime() != null
                ? request.getEndTime() : shift.getEndTime();

        if (newEnd.equals(newStart) || newEnd.isBefore(newStart))
            throw new AppException(ErrorCode.WORK_SHIFT_INVALID_TIME_RANGE);

        if (request.getName() != null)
            shift.setName(request.getName());

        if (request.getStartTime() != null)
            shift.setStartTime(request.getStartTime());

        if (request.getEndTime() != null)
            shift.setEndTime(request.getEndTime());

        if (request.getCoefficient() != null)
            shift.setCoefficient(request.getCoefficient());

        if (request.getIsActive() != null)
            shift.setActive(request.getIsActive());

        return workShiftMapper.toResponse(workShiftRepository.save(shift));
    }

    @Transactional
    public void deleteWorkShift(UUID shiftId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Pessimistic lock
        WorkShiftEntity shift = workShiftRepository
                .findByIdAndFarmIdForUpdate(shiftId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SHIFT_NOT_FOUND));

        // Không xóa khi đã được tham chiếu
        if (workShiftRepository.isShiftReferencedByWorkLog(shiftId))
            throw new AppException(ErrorCode.WORK_SHIFT_IN_USE);

        workShiftRepository.delete(shift);
    }
}