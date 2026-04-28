package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseLocationRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseLocationResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.WarehouseService;
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
public class WarehouseController {

    WarehouseService warehouseService;

    @GetMapping("/api/v1/farms/{farmId}/warehouses")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WarehouseResponse>>> getAllWarehouses(
            @PathVariable("farmId") UUID farmId
    ){
        return ResponseUtil.success(
                warehouseService.findAllWarehouses()
        );
    }

    @PostMapping("/api/v1/farms/{farmId}/warehouses")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WarehouseResponse>> createWarehouse(
            @PathVariable("farmId") UUID farmId,
            @RequestBody @Valid CreateWarehouseRequest request
    ){
        return ResponseUtil.created(
                warehouseService.createWarehouse(farmId, request)
        );
    }

    @DeleteMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId
    ){
        warehouseService.deleteWarehouse(farmId, warehouseId);

        return ResponseUtil.noContent();
    }


    @PostMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/locations")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WarehouseLocationResponse>> createWarehouseLocation(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId,
            @RequestBody @Valid CreateWarehouseLocationRequest request
    ){
        return ResponseUtil.created(
                warehouseService.createWarehouseLocation(warehouseId, request)
        );
    }

    @GetMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/locations")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WarehouseLocationResponse>>> getAllWarehouseLocationsByWarehouseId(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId
    ){
        return ResponseUtil.success(
                warehouseService.findAllWarehousesLocationsByWarehouseId(warehouseId)
        );
    }

    @GetMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/locations/{locationId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWarehouseLocation(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId,
            @PathVariable("locationId") UUID locationId
    ){
        warehouseService.deleteWarehouseLocation(warehouseId, locationId);
        return ResponseUtil.noContent();
    }
}
