package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.common.response.PageableResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseTransactionResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.WarehouseTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Warehouse Transaction API", description = "Quản lý giao dịch kho")
public class WarehouseTransactionController {

    WarehouseTransactionService warehouseTransactionService;

    @Operation(
            summary = "Danh sách giao dịch theo Warehouse",
            description = "Trả về danh sách giao dịch của một Warehouse trong Farm",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/farms/{farmId}/warehouses/{warehouseId}/transactions")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PageableResponse<WarehouseTransactionResponse>>> getTransactionsByWarehouse(
            @PathVariable UUID warehouseId,
            Pageable pageable,
            @PathVariable UUID farmId
    ) {
        return ResponseUtil.success(
                warehouseTransactionService.findAllByWarehouseAndFarm(pageable, warehouseId, farmId)
        );
    }

    @Operation(
            summary = "Danh sách giao dịch theo Farm",
            description = "Trả về danh sách giao dịch của toàn Farm",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/farms/{farmId}/transactions")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PageableResponse<WarehouseTransactionResponse>>> getTransactionsByFarm(
            @PathVariable UUID farmId,
            Pageable pageable
    ) {
        return ResponseUtil.success(
                warehouseTransactionService.findAllByFarm(pageable, farmId)
        );
    }

    @Operation(
            summary = "Danh sách giao dịch theo Warehouse Item",
            description = "Trả về danh sách giao dịch của một vật tư trong kho",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/items/{warehouseItemId}/transactions")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PageableResponse<WarehouseTransactionResponse>>> getTransactionsByWarehouseItem(
            @PathVariable UUID warehouseItemId,
            Pageable pageable
    ) {
        return ResponseUtil.success(
                warehouseTransactionService.findAllByWarehouseItem(pageable, warehouseItemId)
        );
    }
}
