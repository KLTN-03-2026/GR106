package com.farmapp.farmsmartmanagement.modules.plan.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreatePlanRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.PlanResponse;
import com.farmapp.farmsmartmanagement.modules.plan.service.PlanService;
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
public class PlanController {

    PlanService planService;


    @GetMapping("/api/v1/plans")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<PlanResponse>>> findAllByFarm(){
        return ResponseUtil.success(
                planService.findAllByFarm()
        );
    }

    @PostMapping("/api/v1/plans")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PlanResponse>> createPlan(
            @RequestBody @Valid CreatePlanRequest createPlanRequest,
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
