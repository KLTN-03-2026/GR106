package com.farmapp.farmsmartmanagement.modules.farm.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.CreateFarmRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSummaryResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Farm API", description = "Quản lý farm của người dùng")
public class FarmController {

    FarmService farmService;

    // ========================= 1. GET ALL FARMS =========================
    @Operation(
            summary = "Lấy danh sách farm",
            description = "Trả về toàn bộ farm mà user đang sở hữu",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping
    public ApiResponse<List<FarmResponse>> getFarms() {
        return ApiResponse.success(farmService.getFarms());
    }

    // ========================= 2. SUMMARY =========================
    @Operation(
            summary = "Lấy thông tin tổng quan farm",
            description = "Trả về danh sách farm dạng summary (ít field, dùng cho dashboard)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/summary")
    public ApiResponse<List<FarmSummaryResponse>> getFarmSummary() {
        return ApiResponse.success(farmService.getFarmsSummary());
    }

    // ========================= 3. CREATE FARM =========================
    @Operation(
            summary = "Tạo farm mới",
            description = "Tạo một farm mới cho user hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PreAuthorize("hasRole('USER') or hasAuthority('farm:create')")
    @PostMapping
    public ApiResponse<FarmResponse> createFarm(

            @RequestBody(
                    description = "Thông tin farm cần tạo",
                    required = true
            )
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateFarmRequest request
    ){
        return ApiResponse.created(farmService.createFarm(request));
    }
}