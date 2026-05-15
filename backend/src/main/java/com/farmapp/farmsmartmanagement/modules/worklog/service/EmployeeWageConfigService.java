package com.farmapp.farmsmartmanagement.modules.worklog.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmployeeWageConfigEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.EmployeeWageConfigRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmMemberRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.UserRepository;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateEmployeeWageConfigRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.EmployeeWageConfigResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.mapper.EmployeeWageConfigMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

// EmployeeWageConfigService.java
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeWageConfigService {

    EmployeeWageConfigRepository wageConfigRepository;
    FarmMemberRepository farmMemberRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    EmployeeWageConfigMapper wageConfigMapper;
    SecurityUtils securityUtils;

    // Lấy tất cả config của 1 employee
    @Transactional(readOnly = true)
    public List<EmployeeWageConfigResponse> getWageConfigsByEmployee(UUID userId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Kiểm tra employee thuộc farm
        if (!farmMemberRepository.existsByFarm_IdAndUser_IdAndIsActiveTrue(farmId, userId))
            throw new AppException(ErrorCode.FARM_MEMBER_NOT_FOUND);

        return wageConfigMapper.toResponses(
                wageConfigRepository.findAllByFarm_IdAndUser_IdOrderByEffectiveFromDesc(
                        farmId, userId));
    }

    // Lấy tất cả config của toàn farm
    @Transactional(readOnly = true)
    public List<EmployeeWageConfigResponse> getAllWageConfigs() {
        UUID farmId = securityUtils.getCurrentFarmId();
        return wageConfigMapper.toResponses(
                wageConfigRepository.findAllByFarm_IdOrderByEffectiveFromDesc(farmId));
    }

    // Tạo config lương mới
    @Transactional
    public EmployeeWageConfigResponse createWageConfig(
            CreateEmployeeWageConfigRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();

        // Kiểm tra employee thuộc farm
        if (!farmMemberRepository.existsByFarm_IdAndUser_IdAndIsActiveTrue(
                farmId, request.getUserId()))
            throw new AppException(ErrorCode.FARM_MEMBER_NOT_FOUND);

        // Kiểm tra trùng (farm + user + effectiveFrom) — unique constraint
        if (wageConfigRepository.existsByFarm_IdAndUser_IdAndEffectiveFrom(
                farmId, request.getUserId(), request.getEffectiveFrom()))
            throw new AppException(ErrorCode.WAGE_CONFIG_ALREADY_EXISTS);

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity user = userRepository.getReferenceById(request.getUserId());

        EmployeeWageConfigEntity config = EmployeeWageConfigEntity.builder()
                .farm(farm)
                .user(user)
                .dailyRate(request.getDailyRate())
                .otMultiplier(request.getOtMultiplier() != null
                        ? request.getOtMultiplier()
                        : new BigDecimal("1.5"))
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .createdAt(Instant.now())
                .build();

        return wageConfigMapper.toResponse(wageConfigRepository.save(config));
    }

    // Xóa config — chỉ xóa được khi chưa có work_log tham chiếu
    @Transactional
    public void deleteWageConfig(UUID configId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Pessimistic lock
        EmployeeWageConfigEntity config = wageConfigRepository
                .findByIdAndFarmIdForUpdate(configId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.WAGE_CONFIG_NOT_FOUND));

        // Kiểm tra đã có work_log dùng config này chưa
        if (wageConfigRepository.isConfigReferencedByWorkLog(
                farmId,
                config.getUser().getId(),
                config.getEffectiveFrom(),
                config.getEffectiveTo()))
            throw new AppException(ErrorCode.WAGE_CONFIG_IN_USE);

        wageConfigRepository.delete(config);
    }
}