package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateSupplierRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SupplierResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.SupplierService;
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
public class SupplierController {

    SupplierService supplierService;

    @GetMapping("/api/v1/farms/{farmId}/suppliers")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliers(
            @PathVariable("farmId") UUID farmId
    ){
        return ResponseUtil.success(
                supplierService.getSuppliers()
        );
    }

    @PostMapping("/api/v1/farms/{farmId}/suppliers")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
            @PathVariable("farmId") UUID farmId,
            @RequestBody @Valid CreateSupplierRequest request
    ){
        return ResponseUtil.created(
                supplierService.createSupplier(request)
        );
    }

    @DeleteMapping("/api/v1/farms/{farmId}/suppliers/{supplierId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("supplierId") UUID supplierId
    ){
        supplierService.deleteSupplier(supplierId);
        return ResponseUtil.noContent();
    }
}
