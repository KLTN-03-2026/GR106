package com.farmapp.farmsmartmanagement.modules.farm.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.UpdateFarmConfigRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmConfigResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.FarmConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Farm Config API", description = "Quản lý cấu hình trang trại")
public class FarmConfigController {

    FarmConfigService farmConfigService;

    @Operation(summary = "Lấy cấu hình farm",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/farms/{farmId}/config")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<FarmConfigResponse>> getFarmConfig(
            @PathVariable UUID farmId
    ) {
        return ResponseUtil.success(farmConfigService.getFarmConfig());
    }

    @Operation(summary = "Cập nhật cấu hình farm",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/api/v1/farms/{farmId}/config")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<FarmConfigResponse>> updateFarmConfig(
            @PathVariable UUID farmId,
            @RequestBody @Valid UpdateFarmConfigRequest request
    ) {
        return ResponseUtil.success(farmConfigService.updateFarmConfig(request));
    }
}
