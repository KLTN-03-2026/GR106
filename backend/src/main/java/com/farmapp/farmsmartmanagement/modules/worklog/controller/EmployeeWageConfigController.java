package com.farmapp.farmsmartmanagement.modules.worklog.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateEmployeeWageConfigRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.EmployeeWageConfigResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.service.EmployeeWageConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Employee Wage Config API", description = "Quản lý cấu hình lương nhân viên")
public class EmployeeWageConfigController {

    EmployeeWageConfigService wageConfigService;

    @Operation(summary = "Lấy tất cả config lương toàn farm",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/farms/{farmId}/wage-configs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<EmployeeWageConfigResponse>>> getAllWageConfigs(
            @PathVariable UUID farmId
    ) {
        return ResponseUtil.success(wageConfigService.getAllWageConfigs());
    }

    @Operation(summary = "Lấy config lương theo employee",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/farms/{farmId}/members/{userId}/wage-configs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<EmployeeWageConfigResponse>>> getWageConfigsByEmployee(
            @PathVariable UUID farmId,
            @PathVariable UUID userId
    ) {
        return ResponseUtil.success(wageConfigService.getWageConfigsByEmployee(userId));
    }

    @Operation(summary = "Tạo config lương mới",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/api/v1/farms/{farmId}/wage-configs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<EmployeeWageConfigResponse>> createWageConfig(
            @PathVariable UUID farmId,
            @RequestBody @Valid CreateEmployeeWageConfigRequest request
    ) {
        return ResponseUtil.created(wageConfigService.createWageConfig(request));
    }

    @Operation(summary = "Xóa config lương",
            description = "Không thể xóa nếu đã có work log tham chiếu",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/api/v1/farms/{farmId}/wage-configs/{configId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWageConfig(
            @PathVariable UUID farmId,
            @PathVariable UUID configId
    ) {
        wageConfigService.deleteWageConfig(configId);
        return ResponseUtil.noContent();
    }
}
