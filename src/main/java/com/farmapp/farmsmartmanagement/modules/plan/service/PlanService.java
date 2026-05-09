package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.domain.enums.PlanStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdatePlanTimeRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.AddPlotToPlanResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlotSnapshotResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.PlanMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

    PlotRepository plotRepository;
    PlanMapper planMapper;

    PlanPlotRepository planPlotRepository;

    TaskRepository taskRepository;

    SecurityUtils securityUtils;

//    Tất cả farm mà user là member -> check file byPassRlsWithUser.txt
//    @Transactional
//    public List<PlanResponse> getSkus() {
//        return planMapper.toResponses(planRepository.getSkus());
//    }

    // Auto find với Rls -> không cần set farmId
    @Transactional
    public List<PlanResponse> findAllByFarm() {
        return planMapper.toResponses(planRepository.findAll());
    }

    public PlanResponse findById(UUID id) {
        return planMapper.toResponse(planRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND))
        );
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

        if(planRepository.existsByFarm_IdAndName(farm.getId(), request.getName()))
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

    @PreAuthorize("hasAuthority('plan:update')")
    @Transactional
    public PlanResponse updatePlanTime( UUID planId, UpdatePlanTimeRequest request){

        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = planRepository
                .findByIdAndFarm_Id(planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));
        plan.setVersion(request.getVersion());

        if(!planRepository.isPlanCoverAllStages(planId, request.getStartDate(), request.getEndDate()))
            throw new AppException(ErrorCode.PLAN_TIME_CANNOT_LESS_STAGE);

        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());

        return planMapper.toResponse(planRepository.saveAndFlush(plan));
    }

    @Transactional
    @PreAuthorize("hasAuthority('plan:delete')")
    public void deletePlan(UUID planId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = planRepository
                .findByIdAndFarm_Id(planId, farmId)  // ← vừa tìm vừa check ownership
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));
        
        if(workSessionRepository.existsOpenSessionByPlanId(plan.getId()))
            throw new AppException(ErrorCode.PLAN_HAVE_OPEN_SESSION_CANNOT_DELETE_PLAN);

        plan.setDeletedAt(Instant.now());
        plan.setDeletedBy(userRepository.getReferenceById(securityUtils.getCurrentUserId()));
    }
    @Transactional
    @PreAuthorize("hasAuthority('plan:update')")
    public AddPlotToPlanResponse addPlotToPlan(UUID planId, List<UUID> plotIds) {
        UUID farmId = securityUtils.getCurrentFarmId();

        PlanEntity plan = planRepository
                .findByIdAndFarm_Id(planId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLAN_NOT_FOUND));

        List<PlotEntity> plots = plotRepository
                .findAllByIdInAndFarmId(plotIds, farmId);

        if (plots.size() != plotIds.size()) {
            throw new AppException(ErrorCode.PLOT_NOT_FOUND);
        }

        // Lấy những plot đã có trong plan
        List<UUID> existingPlotIds = planPlotRepository.findPlotIdsByPlanId(planId);

        // Chỉ lấy những plot chưa có — bỏ qua plot đã tồn tại
        List<PlotEntity> newPlots = plots.stream()
                .filter(plot -> !existingPlotIds.contains(plot.getId()))
                .toList();

        if (newPlots.isEmpty()) {
            return AddPlotToPlanResponse.builder()
                    .planId(planId)
                    .addedPlots(List.of())
                    .build();
        }

        FarmEntity farm = farmRepository.getReferenceById(farmId);

        List<PlanPlotEntity> planPlots = newPlots.stream()
                .map(plot -> {
                    PlanPlotEntity planPlot = new PlanPlotEntity();
                    planPlot.setPlan(plan);
                    planPlot.setPlot(plot);
                    planPlot.setFarm(farm);
                    planPlot.setPlotNameSnapshot(plot.getName());
                    planPlot.setCreatedAt(Instant.now());
                    return planPlot;
                }).toList();

        planPlotRepository.saveAll(planPlots);

        List<PlotSnapshotResponse> addedPlots = planPlots.stream()
                .map(pp -> PlotSnapshotResponse.builder()
                        .plotId(pp.getPlot().getId())
                        .version(pp.getPlot().getVersion())
                        .plotName(pp.getPlotNameSnapshot())
                        .build())
                .toList();

        return AddPlotToPlanResponse.builder()
                .planId(planId)
                .addedPlots(addedPlots)
                .build();
    }

    @Transactional
    public void deletePlotFromPlan(UUID planId, UUID plotId) {
        PlotEntity plot = planPlotRepository
                .findPlotByPlanIdAndPlotIdForUpdate(planId, plotId)
                .orElseThrow(()->new AppException(ErrorCode.PLAN_PLOT_NOT_FOUND));

        if(taskRepository.existsByPlot_IdAndPlan_Id(plot.getId(), planId))
            throw new AppException(ErrorCode.PLOT_IS_USING_BY_TASK);

        planPlotRepository.deleteByPlot_IdAndPlan_Id(plot.getId(), planId);
    }

    public List<PlotSnapshotResponse> getPlotsByPlan(UUID planId) {
        UUID farmId = securityUtils.getCurrentFarmId();

        if(!planRepository.existsByIdAndFarm_Id(planId,farmId))
            throw new AppException(ErrorCode.PLAN_NOT_FOUND);

        List<PlotEntity> plots = planPlotRepository.findPlotsByPlanId(planId);

        return plots.stream()
                .map(plotEntity -> PlotSnapshotResponse.builder()
                        .plotId(plotEntity.getId())
                        .version(plotEntity.getVersion())
                        .plotName(plotEntity.getName())
                        .build())
                .toList();
    }
}
