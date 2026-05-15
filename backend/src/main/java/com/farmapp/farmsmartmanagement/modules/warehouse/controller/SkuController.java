package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateSkuRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SkuResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.SkuService;
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
public class SkuController {

    SkuService skuService;

    @GetMapping("/api/v1/farms/{farmId}/skus")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<SkuResponse>>> getAllSkus(
            @PathVariable("farmId") UUID farmId
    ){
        return ResponseUtil.success(
                skuService.getSkus()
        );
    }

    @PostMapping("/api/v1/farms/{farmId}/skus")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<SkuResponse>> createSku(
            @PathVariable("farmId") UUID farmId,
            @RequestBody @Valid CreateSkuRequest request
    ){
        return ResponseUtil.created(
                skuService.createSku(request)
        );
    }

    @DeleteMapping("/api/v1/farms/{farmId}/skus/{sku}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteSku(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("sku") String sku
    ){
        skuService.deleteSku(sku);
        return ResponseUtil.noContent();
    }
}
