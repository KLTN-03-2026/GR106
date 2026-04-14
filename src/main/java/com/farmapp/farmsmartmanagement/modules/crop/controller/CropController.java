package com.farmapp.farmsmartmanagement.modules.crop.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateCropTypeRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.request.CreateSystemCropRequest;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropResponse;
import com.farmapp.farmsmartmanagement.modules.crop.dto.response.CropTypeResponse;
import com.farmapp.farmsmartmanagement.modules.crop.service.CropService;
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
public class CropController {
    CropService cropService;

    //--------------------- PUBLIC ------------------------------
    @GetMapping("/api/v1/crop-type")
    public ResponseEntity<ApiResponse<List<CropTypeResponse>>> getAllCropType() {
        return ResponseUtil
                .success(cropService.getAllCropTypes());
    }

    // ---------------------------- PUBLIC ----------------------------
    @GetMapping("/api/v1/crops")
    public ResponseEntity<ApiResponse<List<CropResponse>>> getAllSystemCrops() {
       return  ResponseUtil.success(cropService.getAllSystemCrops());
    }


    // ------------------ ADMIN ----------------------
    @PostMapping("/api/v1/crop-type")
    public ResponseEntity<ApiResponse<CropTypeResponse>> createCropType(
            @RequestBody @Valid CreateCropTypeRequest request
    ) {
        return ResponseUtil
                .created(cropService.createCropType(request));
    }

    // ------------------ ADMIN ----------------------
    @PostMapping("/api/v1/crops")
    public ResponseEntity<ApiResponse<CropResponse>> createSystemCrop(
            @RequestBody @Valid CreateSystemCropRequest request
    ) {
        return ResponseUtil
                .created(cropService.createSystemCrop(request));
    }

    // ------------------ ADMIN ----------------------
    @DeleteMapping("/api/v1/crop-type/{cropTypeId}")
    public ResponseEntity<ApiResponse<Void>> deleteCropType(
            @PathVariable("cropTypeId") UUID cropTypeId
    ) {
        cropService.deleteCropType(cropTypeId);
        return ResponseUtil.noContent();
    }

}
