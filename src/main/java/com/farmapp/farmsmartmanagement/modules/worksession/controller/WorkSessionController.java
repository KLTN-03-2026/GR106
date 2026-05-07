package com.farmapp.farmsmartmanagement.modules.worksession.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.request.*;
import com.farmapp.farmsmartmanagement.modules.worksession.dto.response.WorkSessionResponse;
import com.farmapp.farmsmartmanagement.modules.worksession.service.WorkSessionService;
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
@Tag(name = "Work Session API", description = "Quản lý phiên làm việc (Check-in / Check-out)")
public class WorkSessionController {

    WorkSessionService workSessionService;

    @Operation(summary = "Check-in bắt đầu làm việc",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/sessions/check-in")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkSessionResponse>> checkIn(
            @PathVariable UUID planId,
            @PathVariable UUID stageId,
            @PathVariable UUID taskId,
            @RequestBody @Valid CheckInRequest request
    ) {
        return ResponseUtil.created(workSessionService.checkIn(taskId,stageId,planId, request));
    }

    @Operation(summary = "Check-out kết thúc làm việc",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/api/v1/sessions/{sessionId}/check-out")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkSessionResponse>> checkOut(
            @PathVariable UUID sessionId,
            @RequestBody @Valid CheckOutRequest request
    ) {
        return ResponseUtil.success(workSessionService.checkOut(sessionId, request));
    }

    @Operation(summary = "Điều chỉnh giờ check-out (nhân công quên check-out)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/api/v1/sessions/{sessionId}/adjust-checkout")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkSessionResponse>> adjustCheckout(
            @PathVariable UUID sessionId,
            @RequestBody @Valid AdjustCheckoutRequest request
    ) {
        return ResponseUtil.success(workSessionService.adjustCheckout(sessionId, request));
    }

    @Operation(summary = "Xem session đang mở của bản thân",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/sessions/me/current")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<WorkSessionResponse>> getCurrentSession() {
        return ResponseUtil.success(workSessionService.getCurrentSession());
    }

    @Operation(summary = "Xem tất cả session đang mở trong farm (dành cho cấp trên)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/sessions/open")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkSessionResponse>>> getOpenSessions() {
        return ResponseUtil.success(workSessionService.getOpenSessions());
    }

    @Operation(summary = "Xem lịch sử session của task",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/api/v1/tasks/{taskId}/sessions")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<WorkSessionResponse>>> getSessionsByTask(
            @PathVariable UUID taskId
    ) {
        return ResponseUtil.success(workSessionService.getSessionsByTask(taskId));
    }
}