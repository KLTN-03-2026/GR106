package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseItemRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.WarehouseItemService;
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
public class WarehouseItemController {
    WarehouseItemService warehouseItemService;


    WarehouseService warehouseService;

    @GetMapping("/api/v1/farms/{farmId}/warehouses/items")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WarehouseItemResponse>>> getAllWarehouseItemsByFarm(
            @PathVariable("farmId") UUID farmId
    ){
        return ResponseUtil.success(
                warehouseItemService.getAllWarehouseItemByFarm(farmId)
        );
    }

    @GetMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/items")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WarehouseItemResponse>>> getAllWarehouseItemsByWarehouse(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId
    ){
        return ResponseUtil.success(
                warehouseItemService.getAllWarehouseItemByWarehouse(warehouseId)
        );
    }


    @PostMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/items")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WarehouseItemResponse>> createWarehouseItem(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId,
            @RequestBody @Valid CreateWarehouseItemRequest request
    ){
        return ResponseUtil.success(
                warehouseItemService.createWarehouseItem(warehouseId,request)
        );
    }

}
