package com.farmapp.farmsmartmanagement.modules.plan.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanStageRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdatePlanStageRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageResponse;
import com.farmapp.farmsmartmanagement.modules.plan.service.PlanStageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "PlanStage API", description = "Quản lý giai đoạn sản xuất (Plan Stage) của farm")
public class PlanStageController {

    PlanStageService planStageService;

    @Operation(
            summary = "Tạo GIAI ĐOẠN kế hoạch mới",
            description = "API cho phép tạo GIAI ĐOẠN kế hoạch sản xuất mới cho farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/plans/{planId}/stages")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PlanStageResponse>> createPlan(
            @RequestBody @Valid CreatePlanStageRequest createPlanStageRequest,
            @PathVariable("planId") UUID planId
    ){
        return ResponseUtil.created(
                planStageService.createPlanStageCustom(
                        planId,
                        createPlanStageRequest
                )
        );
    }

    @GetMapping("/api/v1/plans/{planId}/stages")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanStageResponse>>> getAllPlanStages(
            @PathVariable("planId") UUID planId
    ){
        return ResponseUtil.success(
                planStageService.findAllByPlanId(planId)
        );
    }

    @PatchMapping("/api/v1/plans/{planId}/stages/{stageId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PlanStageResponse>> updatePlanStageCustom(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @RequestBody @Valid UpdatePlanStageRequest request
    ){
        return ResponseUtil.success(
                planStageService.updatePlanStageCustom(planId, stageId, request)
        );
    }

    @DeleteMapping("/api/v1/plans/{planId}/stages/{stageId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deletePlanStage(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId
    ){
        planStageService.deletePlanStageCustom(stageId);
        return  ResponseUtil.noContent();
    }
}
