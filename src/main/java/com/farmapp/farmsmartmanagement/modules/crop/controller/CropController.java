package com.farmapp.farmsmartmanagement.modules.crop.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateCropTypeRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateSystemCropRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropResponse;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropTypeResponse;
import com.farmapp.farmsmartmanagement.modules.crop.service.CropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
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
@Tag(name = "Crop API", description = "Quản lý cây trồng và loại cây trồng trong hệ thống")
public class CropController {
    CropService cropService;

    //--------------------- PUBLIC ------------------------------
    @Operation(
            summary = "PUBLIC Lấy danh sách loại cây trồng",
            description = "API trả về toàn bộ loại cây trồng (crop types) trong hệ thống"
    )
    @GetMapping("/api/v1/crop-types")
    public ResponseEntity<ApiResponse<List<CropTypeResponse>>> getAllCropType() {
        return ResponseUtil
                .success(cropService.getAllCropTypes());
    }

    // ---------------------------- PUBLIC ----------------------------
    @Operation(
            summary = "PUBLIC Lấy danh sách cây trồng hệ thống",
            description = "API trả về tất cả cây trồng thuộc phạm vi hệ thống (SYSTEM scope)"
    )
    @GetMapping("/api/v1/crops")
    public ResponseEntity<ApiResponse<List<CropResponse>>> getAllSystemCrops() {
        return  ResponseUtil.success(cropService.getAllSystemCrops());
    }

    @Operation(
            summary = "PUBLIC Lấy danh sách cây trồng hệ thống",
            description = "API trả về tất cả cây trồng thuộc phạm vi hệ thống (SYSTEM scope)"
    )
    @GetMapping("/api/v1/crops/{cropId}")
    public ResponseEntity<ApiResponse<CropResponse>> getSystemCropById(
            @PathVariable UUID cropId
    ) {
        return  ResponseUtil.success(cropService.getSystemCropById(cropId));
    }



    // ---------------------------- FARM ----------------------------
    @Operation(
            summary = "PUBLIC Lấy danh sách cây trồng của farm",
            description = "API trả về tất cả cây trồng thuộc phạm vi FARM (FARM scope)"
    )
    @GetMapping("/api/v1/farms/{farmId}/crops")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<CropResponse>>> getAllFarmCrops(
            @PathVariable UUID farmId
    ) {
        return  ResponseUtil.success(
                cropService.getAllFarmCrops(farmId)
        );
    }

    @Operation(
            summary = "PUBLIC Lấy 1 cây trồng của farm",
            description = "API trả về cây trồng thuộc phạm vi FARM (FARM scope)"
    )
    @GetMapping("/api/v1/farms/{farmId}/crops/{cropId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<CropResponse>> getFarmCropById(
            @PathVariable UUID farmId,
            @PathVariable UUID cropId
    ) {
        return  ResponseUtil.success(
                cropService.getFarmCropByIdAndFarmId(cropId, farmId)
        );
    }

    // ------------------ ADMIN ----------------------
    @Operation(
            summary = "ADMIN Tạo loại cây trồng mới",
            description = "API cho phép admin tạo mới một loại cây trồng (crop type)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/crop-type")
    public ResponseEntity<ApiResponse<CropTypeResponse>> createCropType(
            @RequestBody @Valid CreateCropTypeRequest request
    ) {
        return ResponseUtil
                .created(cropService.createCropType(request));
    }

    // ------------------ ADMIN ----------------------
    @Operation(
            summary = "ADMIN Tạo cây trồng hệ thống",
            description = "API cho phép admin tạo mới cây trồng thuộc hệ thống (scope = SYSTEM)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/crops")
    public ResponseEntity<ApiResponse<CropResponse>> createSystemCrop(
            @RequestBody @Valid CreateSystemCropRequest request
    ) {
        return ResponseUtil
                .created(cropService.createSystemCrop(request));
    }

    // ------------------ ADMIN ----------------------
    @Operation(
            summary = "ADMIN Xóa loại cây trồng",
            description = "API cho phép admin xóa một loại cây trồng theo ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/api/v1/crop-type/{cropTypeId}")
    public ResponseEntity<ApiResponse<Void>> deleteCropType(
            @Parameter(description = "ID của loại cây trồng", required = true)
            @PathVariable("cropTypeId") UUID cropTypeId
    ) {
        cropService.deleteCropType(cropTypeId);
        return ResponseUtil.noContent();
    }

}