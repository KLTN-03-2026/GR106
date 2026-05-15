package com.farmapp.farmsmartmanagement.modules.worklog.controller;


import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateWorkShiftRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.UpdateWorkShiftRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkShiftResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.service.WorkShiftService;
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
@Tag(name = "Work Shift API", description = "Quản lý ca làm việc")
public class WorkShiftController {

    WorkShiftService workShiftService;

    @Operation(summary = "Lấy danh sách ca làm việc",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/farms/{farmId}/work-shifts")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkShiftResponse>>> getAllWorkShifts(
            @PathVariable UUID farmId
    ) {
        return ResponseUtil.success(workShiftService.getAllWorkShifts());
    }

    @Operation(summary = "Tạo ca làm việc mới",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/api/v1/farms/{farmId}/work-shifts")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkShiftResponse>> createWorkShift(
            @PathVariable UUID farmId,
            @RequestBody @Valid CreateWorkShiftRequest request
    ) {
        return ResponseUtil.created(workShiftService.createWorkShift(request));
    }

    @Operation(summary = "Cập nhật ca làm việc",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/api/v1/farms/{farmId}/work-shifts/{shiftId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkShiftResponse>> updateWorkShift(
            @PathVariable UUID farmId,
            @PathVariable UUID shiftId,
            @RequestBody @Valid UpdateWorkShiftRequest request
    ) {
        return ResponseUtil.success(workShiftService.updateWorkShift(shiftId, request));
    }

    @Operation(summary = "Xóa ca làm việc",
            description = "Không thể xóa nếu ca đã được sử dụng trong work log",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/api/v1/farms/{farmId}/work-shifts/{shiftId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWorkShift(
            @PathVariable UUID farmId,
            @PathVariable UUID shiftId
    ) {
        workShiftService.deleteWorkShift(shiftId);
        return ResponseUtil.noContent();
    }
}