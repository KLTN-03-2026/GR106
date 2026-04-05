package com.farmapp.farmsmartmanagement.modules.farm.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSelectResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.FarmAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
public class SelectFarmController {

    private final FarmAuthService farmAuthService;

    /**
     * POST /api/v1/farms/{farmId}/select
     *
     * Yêu cầu: user token (chưa có farmId).
     * Trả về: farm token (có farmId + permissions).
     *
     * Client lưu token mới này và dùng cho mọi request tiếp theo.
     */
    @PostMapping("/{farmId}/select")
    public ApiResponse<FarmSelectResponse> selectFarm(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.success(farmAuthService.selectFarm(principal.getUserId(), farmId));
    }
}