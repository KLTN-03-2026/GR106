package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseItemRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.UpdateWarehouseItemRequest;
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
    public ResponseEntity<ApiResponse<List<WarehouseItemResponse>>> getAllWarehouseItemsByWarehouseAndFarm(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId
    ){
        return ResponseUtil.success(
                warehouseItemService.getAllWarehouseItemByWarehouseAndFarm(warehouseId,farmId)
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

    @PatchMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/items/{warehouseItemId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WarehouseItemResponse>> updateWarehouseItem(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId,
            @PathVariable("warehouseItemId") UUID warehouseItemId,
            @RequestBody @Valid UpdateWarehouseItemRequest request
    ){
        return ResponseUtil.success(
                warehouseItemService
                        .updateWarehouseItem(
                                farmId,
                                warehouseId,
                                warehouseItemId,
                                request
                        )
        );
    }

    @DeleteMapping("/api/v1/farms/{farmId}/items/{warehouseItemId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWarehouseItemByIdAndFarm(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseItemId") UUID warehouseItemId
    ){
        warehouseItemService.deleteWarehouseItemByIdAndFarm(warehouseItemId, farmId);

        return ResponseUtil.noContent();
    }

    @DeleteMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/items/{warehouseItemId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWarehouseItemByIdAndWarehouseAndFarm(
            @PathVariable("farmId") UUID farmId,
            @PathVariable("warehouseId") UUID warehouseId,
            @PathVariable("warehouseItemId") UUID warehouseItemId
    ){
        warehouseItemService
                .deleteWarehouseItemByIdAndWarehouseAndFarm(warehouseItemId, warehouseId, farmId);

        return ResponseUtil.noContent();
    }

}
