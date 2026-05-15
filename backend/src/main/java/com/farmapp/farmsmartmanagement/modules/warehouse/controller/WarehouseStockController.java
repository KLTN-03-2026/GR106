package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemStockByLocationResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.WarehouseStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Warehouse Stock API", description = "Tồn kho theo vị trí")
public class WarehouseStockController {

    WarehouseStockService warehouseStockService;

    @Operation(
            summary = "Lấy danh sách vị trí kho còn tồn của một vật tư",
            description = "Dùng khi checkout work session — hiển thị các ô kho còn hàng để user chọn fromLocationId",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/warehouse/items/{warehouseItemId}/locations/stock")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WarehouseItemStockByLocationResponse>>> getStockByLocation(
            @PathVariable UUID warehouseItemId
    ) {
        return ResponseUtil.success(warehouseStockService.getStockByLocation(warehouseItemId));
    }
}