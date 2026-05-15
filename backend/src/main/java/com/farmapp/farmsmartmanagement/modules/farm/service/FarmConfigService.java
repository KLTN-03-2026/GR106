package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmConfigEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmConfigRepository;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.UpdateFarmConfigRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmConfigResponse;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmConfigMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmConfigService {

    FarmConfigRepository farmConfigRepository;
    FarmConfigMapper farmConfigMapper;
    SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public FarmConfigResponse getFarmConfig() {
        UUID farmId = securityUtils.getCurrentFarmId();

        FarmConfigEntity config = farmConfigRepository.findByFarmId(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_CONFIG_NOT_FOUND));

        return farmConfigMapper.toResponse(config);
    }

    @Transactional
    public FarmConfigResponse updateFarmConfig(UpdateFarmConfigRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();

        // Pessimistic lock — tránh race condition
        FarmConfigEntity config = farmConfigRepository.findByFarmIdForUpdate(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_CONFIG_NOT_FOUND));

        // Optimistic lock — tránh lost update
        if (!config.getVersion().equals(request.getVersion()))
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);

        if (request.getTimezone() != null)
            config.setTimezone(request.getTimezone());

        if (request.getLocale() != null)
            config.setLocale(request.getLocale());

        if (request.getCurrency() != null)
            config.setCurrency(request.getCurrency());

        if (request.getAllowCropClone() != null)
            config.setAllowCropClone(request.getAllowCropClone());

        if (request.getTaskOverdueNotifyDays() != null)
            config.setTaskOverdueNotifyDays(request.getTaskOverdueNotifyDays());

        config.setUpdatedAt(Instant.now());

        return farmConfigMapper.toResponse(farmConfigRepository.save(config));
    }
}