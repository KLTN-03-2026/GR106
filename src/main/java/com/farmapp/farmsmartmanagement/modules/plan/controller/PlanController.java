package com.farmapp.farmsmartmanagement.modules.plan.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanResponse;
import com.farmapp.farmsmartmanagement.modules.plan.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Plan API", description = "Quản lý kế hoạch sản xuất (plan) của farm")
public class PlanController {

    PlanService planService;


    @Operation(
            summary = "Lấy danh sách kế hoạch của farm",
            description = "API trả về toàn bộ kế hoạch (plan) thuộc farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/plans")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanResponse>>> findAllByFarm(){
        return ResponseUtil.success(
                planService.findAllByFarm()
        );
    }

    @Operation(
            summary = "Tạo kế hoạch mới",
            description = "API cho phép tạo kế hoạch sản xuất mới cho farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/plans")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PlanResponse>> createPlan(
            @RequestBody @Valid CreatePlanRequest createPlanRequest,
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ){
        return ResponseUtil.created(
                planService.createPlan(
                        userPrincipal.getFarmId(),
                        userPrincipal.getUserId(),
                        createPlanRequest
                )
        );
    }

}