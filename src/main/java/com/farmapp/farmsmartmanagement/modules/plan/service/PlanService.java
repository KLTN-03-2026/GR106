package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.domain.enums.PlanStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.CropRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlanRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.UserRepository;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlanService {
    PlanRepository planRepository;

    CropRepository cropRepository;

    FarmRepository farmRepository;
    UserRepository userRepository;

    PlanMapper planMapper;


//    Tất cả farm mà user là member -> check file byPassRlsWithUser.txt
//    @Transactional
//    public List<PlanResponse> findAll() {
//        return planMapper.toResponses(planRepository.findAll());
//    }

    // Auto find với Rls -> không cần set farmId
    @Transactional
    public List<PlanResponse> findAllByFarm() {
        return planMapper.toResponses(planRepository.findAll());
    }

    @Transactional
    public PlanResponse createPlan(UUID farmId, UUID userId, CreatePlanRequest request){
        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        UserEntity createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        CropEntity crop = cropRepository.findByIdAndScope(request.getCropId(), CropScope.SYSTEM);

        if(crop == null){
            crop = cropRepository.findByIdAndScope(request.getCropId(), CropScope.FARM);
        }

        if(crop == null)
            throw new AppException(ErrorCode.CROP_NOT_FOUND);

        if(planRepository.existsByFarmIdAndName(farm.getId(), request.getName()))
            throw new AppException(ErrorCode.PLAN_ALREADY_EXISTS);

        PlanEntity newPlan = new PlanEntity();
        newPlan.setName(request.getName());
        newPlan.setFarm(farm);
        newPlan.setCrop(crop);
        newPlan.setStatus(PlanStatus.ACTIVE);
        newPlan.setStartDate(request.getStartDate());
        newPlan.setEndDate(request.getEndDate());
        newPlan.setCreatedBy(createdBy);
        newPlan.setNotes(request.getNote());
        newPlan.setCreatedAt(Instant.now());

        return planMapper.toResponse(planRepository.save(newPlan));
    }


}
