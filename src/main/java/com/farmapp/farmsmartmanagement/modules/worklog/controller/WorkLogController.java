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

    // ─────────────────────────────────────────────────────────────────────────
    // Tạo WorkLog
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Tạo WorkLog mới",
            description = "Tạo nhật ký công việc cho một Task",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/tasks/{taskId}/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkLogResponse>> createWorkLog(
            @PathVariable UUID taskId,
            @RequestBody @Valid CreateWorkLogRequest request
    ) {
        return ResponseUtil.created(workLogService.createWorkLog(taskId, request));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lấy danh sách WorkLog theo Task
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Lấy danh sách WorkLog theo Task",
            description = "Trả về tất cả WorkLog của một Task, sắp xếp theo ngày giảm dần",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/tasks/{taskId}/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByTask(
            @PathVariable UUID taskId
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByTask(taskId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Xem chi tiết 1 WorkLog — bao gồm vật tư đã dùng
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Xem chi tiết WorkLog",
            description = "Trả về chi tiết một WorkLog bao gồm danh sách vật tư đã sử dụng",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/tasks/{taskId}/worklogs/{workLogId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkLogDetailResponse>> getWorkLogDetail(
            @PathVariable UUID taskId,
            @PathVariable UUID workLogId
    ) {
        return ResponseUtil.success(workLogService.getWorkLogDetail(workLogId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lấy chấm công theo employee trong khoảng thời gian
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Lấy WorkLog theo Employee",
            description = "Trả về danh sách WorkLog của một nhân viên trong khoảng thời gian",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/worklogs/employee/{employeeId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByEmployee(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByEmployee(employeeId, from, to));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lấy chấm công toàn farm
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Lấy WorkLog toàn Farm",
            description = "Trả về danh sách WorkLog của toàn Farm trong khoảng thời gian",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/worklogs")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogResponse>>> getWorkLogsByFarm(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogsByFarm(from, to));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tổng hợp công theo employee — dùng cho tính lương
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Tổng hợp công theo Employee",
            description = "Trả về tổng hợp ngày công và lương của từng nhân viên trong khoảng thời gian. Tối đa 3 tháng.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/worklogs/summary")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkLogSummaryResponse>>> getWorkLogSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseUtil.success(workLogService.getWorkLogSummary(from, to));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Xóa WorkLog — chỉ xóa được khi chưa bị lock
    // ─────────────────────────────────────────────────────────────────────────
    @Operation(
            summary = "Xóa WorkLog",
            description = "Xóa một WorkLog. Không thể xóa nếu WorkLog đã bị khóa (locked_at != null)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/api/v1/tasks/{taskId}/worklogs/{workLogId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteWorkLog(
            @PathVariable UUID taskId,
            @PathVariable UUID workLogId
    ) {
        workLogService.deleteWorkLog(taskId, workLogId);
        return ResponseUtil.noContent();
    }
}
