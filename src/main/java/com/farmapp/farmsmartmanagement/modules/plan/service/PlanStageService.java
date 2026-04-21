package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.PlanStageSource;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageStatusEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanStageRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdatePlanStageRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdatePlanStageTimeRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanStageMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlanStageService {

    PlanRepository planRepository;
    PlanStageRepository planStageRepository;
    PlanStageStatusRepository planStageStatusRepository;
    FarmRepository farmRepository;
    TaskRepository taskRepository;


    PlanStageMapper planStageMapper;

    SecurityUtils securityUtils;

    @Transactional
    public List<PlanStageResponse> findAll(){
        return planStageMapper.toResponses(
                planStageRepository.findAll()
        );
    }


    @Transactional
    public List<PlanStageResponse> findAllByPlanId(UUID planId){
        UUID farmId = securityUtils.getCurrentFarmId();

        if(!planRepository.existsByIdAndFarm_Id(planId, farmId))
            throw new AppException(ErrorCode.FARM_NOT_FOUND);

        PlanEntity plan = planRepository.findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));

        if (!plan.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.PLAN_NOT_FOUND);
        }

        return planStageMapper.toResponses(planStageRepository.findAllByPlanId(planId));
    }
    // plan -> previousStage(orderIndex) -> status -> save
    @Transactional
    public PlanStageResponse createPlanStageCustom(UUID planId, CreatePlanStageRequest request){

        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = planRepository.findByIdAndFarm_Id(planId,farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));

        if (!plan.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.PLAN_NOT_FOUND);
        }

        if(planStageRepository.existsByPlanIdAndName(planId, request.getName()))
            throw new AppException(ErrorCode.PLAN_STAGE_ALREADY_EXISTS);

        if(plan.getStartDate().isAfter(request.getStartDate())
                || plan.getEndDate().isBefore(request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_TIME_MUST_BE_IN_PLAN_TIME);

        if(planStageRepository.existsOverlapping(planId, request.getStartDate(), request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);

        //Lấy giai đoạn trước đó -> để khởi tạo index
        List<PlanStageEntity> previousStage = planStageRepository
                .findPreviousStage(planId, request.getStartDate(), PageRequest.of(0,1));

        int orderIndex = 1;

        if(!previousStage.isEmpty()) orderIndex = previousStage.getFirst().getOrderIndex() + 1;

        List<PlanStageStatusEntity> statusEntityList = planStageStatusRepository
                .findByIsInitialTrue(PageRequest.of(0,1));

        if(statusEntityList.isEmpty())
            throw new AppException(ErrorCode.PLAN_STAGE_STATUS_INITIAL_NOT_FOUND);

        PlanStageEntity newPlanStage = new PlanStageEntity();
        newPlanStage.setPlan(plan);
        newPlanStage.setName(request.getName());
        newPlanStage.setSource(PlanStageSource.CUSTOM);
        newPlanStage.setOrderIndex((short) orderIndex);
        newPlanStage.setStartDate(request.getStartDate());
        newPlanStage.setEndDate(request.getEndDate());
        newPlanStage.setStatus(statusEntityList.getFirst());

        return  planStageMapper.toResponse(planStageRepository.save(newPlanStage));
    }

    @Transactional
    public PlanStageResponse updatePlanStageCustom(UUID planId, UUID planStageId, UpdatePlanStageRequest request){
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = planRepository.findByIdAndFarm_Id(planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));

        PlanStageEntity planStage = planStageRepository.findByIdAndPlanId(planStageId, planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        if(plan.getStartDate().isAfter(request.getStartDate())
                || plan.getEndDate().isBefore(request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_TIME_MUST_BE_IN_PLAN_TIME);

        if(request.getStartDate()!=null && request.getEndDate()!=null){

            if(planStageRepository.existsOverlappingWithoutId(planId, planStageId, request.getStartDate(), request.getEndDate())) {
                throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);
            }

            if(taskRepository.existsTaskOutsideStage(planStageId,request.getStartDate(), request.getEndDate()))
                throw new AppException(ErrorCode.PLAN_STAGE_NOT_COVER_TASK);

        }




        planStageMapper.updateEntityFromRequest(request, planStage);

        return planStageMapper.toResponse(planStageRepository.save(planStage));
    }

    //
    @Transactional
    public PlanStageResponse updatePlanStageTime(UUID planId, UUID planStageId, UpdatePlanStageTimeRequest request){

        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = planRepository.findByIdAndFarm_Id(planId,farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));

        PlanStageEntity planStage = planStageRepository
                .findByIdAndPlanId(planStageId, planId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_STAGE_NOT_FOUND));

        if(plan.getStartDate().isAfter(request.getStartDate())
                || plan.getEndDate().isBefore(request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_TIME_MUST_BE_IN_PLAN_TIME);

        if(planStageRepository.existsOverlappingWithoutId(
                planId, planStageId, request.getStartDate(), request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);


        if(request.getStartDate()!=null && request.getEndDate()!=null){

            if(planStageRepository.existsOverlappingWithoutId(planId, planStageId, request.getStartDate(), request.getEndDate())) {
                throw new AppException(ErrorCode.PLAN_STAGE_OVERLAP);
            }

            if(taskRepository.existsTaskOutsideStage(planStageId,request.getStartDate(), request.getEndDate()))
                throw new AppException(ErrorCode.PLAN_STAGE_NOT_COVER_TASK);

        }

        planStage.setStartDate(request.getStartDate());
        planStage.setEndDate(request.getEndDate());

        return planStageMapper.toResponse(planStageRepository.save(planStage));
    }

    @Transactional
    public void deletePlanStageCustom(UUID stageId){
        taskRepository.deleteByPlanStageId(stageId);

        planStageRepository.deleteById(stageId);
    }
}
