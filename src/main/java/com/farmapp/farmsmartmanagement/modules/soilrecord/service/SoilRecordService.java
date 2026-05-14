package com.farmapp.farmsmartmanagement.modules.soilrecord.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.request.CreateSoilRecordRequest;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.request.UpdateSoilRecordRequest;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.response.SoilRecordResponse;
import com.farmapp.farmsmartmanagement.modules.soilrecord.mapper.SoilRecordMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SoilRecordService {
    SoilRecordRepository soilRecordRepository;
    PlotRepository plotRepository;
    SecurityUtils securityUtils;
    FarmRepository farmRepository;
    UserRepository userRepository;
    SoilRecordMapper soilRecordMapper;
    FarmConfigRepository farmConfigRepository;
    SoilAiResultRepository soilAiResultRepository;


    @Transactional(readOnly = true)
    public List<SoilRecordResponse> findAllByFarmId() {
        UUID farmId = securityUtils.getCurrentFarmId();
        return soilRecordMapper.toResponses(soilRecordRepository.findByFarm_Id(farmId));
    }


    @Transactional(readOnly = true)
    public List<SoilRecordResponse> findAllByPlotId(UUID plotId) {
        return soilRecordMapper.toResponses(soilRecordRepository.findByPlot_Id(plotId));
    }


    @Transactional
    public SoilRecordResponse createSoilRecord(UUID plotId, CreateSoilRecordRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        FarmEntity farm = farmRepository.getReferenceById(farmId);
        UserEntity user = userRepository.getReferenceById(userId);



        PlotEntity plot = plotRepository
                .findByIdAndFarmId(plotId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));



        SoilRecordEntity newSoilRecord = new SoilRecordEntity();
        newSoilRecord.setFarm(farm);
        newSoilRecord.setPlot(plot);
        newSoilRecord.setCreatedBy(user);
        newSoilRecord.setSampledAt(request.getSampledAt());
        newSoilRecord.setPh(request.getPh());
        newSoilRecord.setNitrogenMgKg(request.getNitrogenMgKg());
        newSoilRecord.setPhosphorusMgKg(request.getPhosphorusMgKg());
        newSoilRecord.setPotassiumMgKg(request.getPotassiumMgKg());
        newSoilRecord.setMoisturePercent(request.getMoisturePercent());
        newSoilRecord.setNotes(request.getNotes());
        newSoilRecord.setSourceFileUrl(request.getSourceFileUrl());
        newSoilRecord.setLockedAt(null);
        newSoilRecord.setDeletedAt(null);
        newSoilRecord.setCreatedAt(getNowByFarm(farmId));


        return soilRecordMapper.toResponse(soilRecordRepository.save(newSoilRecord));
    }

    @Transactional
    public SoilRecordResponse updateSoilRecord(UUID soilRecordId, UpdateSoilRecordRequest request) {
        UUID farmId = securityUtils.getCurrentFarmId();
        UUID userId = securityUtils.getCurrentUserId();

        // Lấy bản ghi soil record cần update
        SoilRecordEntity soilRecord = soilRecordRepository
                .findByIdAndFarm_Id(soilRecordId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.SOIL_RECORD_NOT_FOUND));

        if(soilRecord.getLockedAt()!=null) {
            throw new AppException(ErrorCode.SOIL_RECORD_ALREADY_BLOCKED);
        }


        if (request.getSampledAt() != null) {
            soilRecord.setSampledAt(request.getSampledAt());
        }
        if (request.getPh() != null) {
            soilRecord.setPh(request.getPh());
        }
        if (request.getNitrogenMgKg() != null) {
            soilRecord.setNitrogenMgKg(request.getNitrogenMgKg());
        }
        if (request.getPhosphorusMgKg() != null) {
            soilRecord.setPhosphorusMgKg(request.getPhosphorusMgKg());
        }
        if (request.getPotassiumMgKg() != null) {
            soilRecord.setPotassiumMgKg(request.getPotassiumMgKg());
        }
        if (request.getMoisturePercent() != null) {
            soilRecord.setMoisturePercent(request.getMoisturePercent());
        }
        if (request.getNotes() != null) {
            soilRecord.setNotes(request.getNotes());
        }
        if (request.getSourceFileUrl() != null) {
            soilRecord.setSourceFileUrl(request.getSourceFileUrl());
        }
        if (Boolean.TRUE.equals(request.getIsLocked())) {
            soilRecord.setLockedAt(getNowByFarm(farmId));
        }


        // Audit: cập nhật người sửa
        UserEntity user = userRepository.getReferenceById(userId);
        soilRecord.setCreatedBy(user);

        return soilRecordMapper.toResponse(soilRecordRepository.save(soilRecord));
    }


    @Transactional
    public void deleteSoilRecord(UUID soilRecordId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        SoilRecordEntity soilRecord = soilRecordRepository
                .findByIdAndFarm_Id(soilRecordId,farmId)
                .orElseThrow(() -> new AppException(ErrorCode.SOIL_RECORD_NOT_FOUND));

//      soilAiResultRepository.deleteAllBySoilRecordId(soilRecord.getId());
        soilRecord.setDeletedAt(getNowByFarm(farmId));

        soilRecordRepository.save(soilRecord);
    }

    private Instant getNowByFarm(UUID farmId) {
        FarmConfigEntity farmConfig = farmConfigRepository
                .findByFarmId(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_CONFIG_NOT_FOUND));
        return Instant.now(Clock.system(ZoneId.of(farmConfig.getTimezone())));
    }

}