package com.farmapp.farmsmartmanagement.modules.plan.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanStageStatusTransitionResponse;
import com.farmapp.farmsmartmanagement.modules.plan.service.PlanStageStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Plan Stage Status API", description = "Quản lý trạng thái giai đoạn kế hoạch (Plan Stage Status)")
public class PlanStageStatusController {

    PlanStageStatusService planStageStatusService;

    @Operation(summary = "Danh sách tất cả Plan Stage Status",
            description = "API trả về toàn bộ danh sách trạng thái giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/plan-stage-statuses")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanStageStatusResponse>>> getAllPlanStageStatuses() {
        return ResponseUtil.success(planStageStatusService.findAllPlanStageStatus());
    }

    @Operation(summary = "Danh sách lịch sử trạng thái của Plan Stage",
            description = "API trả về lịch sử thay đổi trạng thái của một giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/status-histories")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanStageStatusHistoryResponse>>> getPlanStageStatusHistories(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId) {
        return ResponseUtil.success(planStageStatusService.findAllPlanStageStatusHistory(planId, stageId));
    }

    @Operation(summary = "Danh sách trạng thái tiếp theo hợp lệ của Plan Stage",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/available-statuses")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanStageStatusResponse>>> getPlanStageStatusAvailableByPlanStageAndFarm(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId) {
        return ResponseUtil.success(
                planStageStatusService
                        .findAllPlanStageStatusAvailableByPlanStageAndFarm(stageId)
        );
    }

    @Operation(summary = "Danh sách transition trạng thái theo Farm",
            description = "API trả về các transition trạng thái hợp lệ theo Farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/plan-stage-status-transitions")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanStageStatusTransitionResponse>>> getPlanStageStatusTransitions() {
        return ResponseUtil.success(planStageStatusService.findAllPlanStageStatusTransitionByFarm());
    }

    @Operation(summary = "Cập nhật trạng thái Plan Stage",
            description = "API cho phép cập nhật trạng thái của một giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/api/v1/plans/{planId}/stages/{stageId}/status/{statusId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PlanStageStatusHistoryResponse>> updatePlanStageStatus(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("statusId") UUID statusId) {
        return ResponseUtil.success(planStageStatusService.updatePlanStageStatus(planId, stageId, statusId));
    }
}
