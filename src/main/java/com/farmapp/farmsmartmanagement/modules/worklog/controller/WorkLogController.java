package com.farmapp.farmsmartmanagement.modules.worklog.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.request.CreateWorkLogRequest;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogDetailResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.dto.response.WorkLogSummaryResponse;
import com.farmapp.farmsmartmanagement.modules.worklog.service.WorkLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "WorkLog API", description = "Quản lý nhật ký công việc (WorkLog)")
public class WorkLogController {

    WorkLogService workLogService;

    @Operation(summary = "Tạo WorkLog mới",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/api/v1/plans/{planId}/stages/{planStageId}/tasks/{taskId}/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkLogResponse>> createWorkLog(
            @PathVariable UUID planId,
            @PathVariable UUID planStageId,
            @PathVariable UUID taskId,
            @RequestBody @Valid CreateWorkLogRequest request
    ) {
        return ResponseUtil.created(
                workLogService.createWorkLog(taskId, planStageId, planId, request));
    }

    @Operation(summary = "Lấy danh sách WorkLog theo Task",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/plans/{planId}/stages/{planStageId}/tasks/{taskId}/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByTask(
            @PathVariable UUID planId,
            @PathVariable UUID planStageId,
            @PathVariable UUID taskId
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByTask(taskId));
    }

    @Operation(summary = "Lấy danh sách WorkLog theo Plan (dùng cho AttendanceManagement)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/plans/{planId}/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByPlan(
            @PathVariable UUID planId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByPlan(planId, from, to));
    }

    @Operation(summary = "Xem chi tiết WorkLog",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/worklogs/{workLogId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkLogDetailResponse>> getWorkLogDetail(
            @PathVariable UUID workLogId
    ) {
        return ResponseUtil.success(workLogService.getWorkLogDetail(workLogId));
    }

    @Operation(summary = "Lấy WorkLog theo Employee",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/worklogs/employee/{employeeId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByEmployee(
            @PathVariable UUID employeeId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByEmployee(employeeId, from, to));
    }

    @Operation(summary = "Lấy WorkLog toàn Farm",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByFarm(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByFarm(from, to));
    }

    @Operation(summary = "Tổng hợp công theo Employee (tính lương)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/worklogs/summary")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogSummaryResponse>>> getWorkLogSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogSummary(from, to));
    }

    @Operation(summary = "Khoá WorkLog (cấp trên duyệt)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/api/v1/worklogs/{workLogId}/lock")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkLogResponse>> lockWorkLog(
            @PathVariable UUID workLogId
    ) {
        return ResponseUtil.success(workLogService.lockWorkLog(workLogId));
    }

    @Operation(summary = "Mở khoá WorkLog",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/api/v1/worklogs/{workLogId}/unlock")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkLogResponse>> unlockWorkLog(
            @PathVariable UUID workLogId
    ) {
        return ResponseUtil.success(workLogService.unlockWorkLog(workLogId));
    }

    @Operation(summary = "Xóa WorkLog",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/api/v1/plans/{planId}/stages/{planStageId}/tasks/{taskId}/worklogs/{workLogId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWorkLog(
            @PathVariable UUID planId,
            @PathVariable UUID planStageId,
            @PathVariable UUID taskId,
            @PathVariable UUID workLogId
    ) {
        workLogService.deleteWorkLog(taskId, workLogId);
        return ResponseUtil.noContent();
    }
}