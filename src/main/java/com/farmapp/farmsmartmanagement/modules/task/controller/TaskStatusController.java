package com.farmapp.farmsmartmanagement.modules.task.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusHistoryResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskStatusTransitionResponse;
import com.farmapp.farmsmartmanagement.modules.task.service.TaskStatusService;
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
@Tag(name = "Task Status API", description = "Quản lý trạng thái công việc (Task Status)")
public class TaskStatusController {

    TaskStatusService taskStatusService;

    @Operation(
            summary = "Danh sách tất cả Task Status",
            description = "API trả về toàn bộ danh sách trạng thái công việc",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/task-statuses")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<TaskStatusResponse>>> getAllTaskStatuses() {
        return ResponseUtil.success(taskStatusService.findAllTaskStatus());
    }

    @Operation(
            summary = "Danh sách lịch sử trạng thái của Task",
            description = "API trả về lịch sử thay đổi trạng thái của một Task",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/status-histories")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<TaskStatusHistoryResponse>>> getTaskStatusHistories(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId
    ) {
        return ResponseUtil.success(
                taskStatusService.findAllTaskStatusHistory(planId, stageId, taskId)
        );
    }

    @Operation(
            summary = "Danh sách transition trạng thái theo Farm",
            description = "API trả về các transition trạng thái hợp lệ theo Farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/task-status-transitions")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<TaskStatusTransitionResponse>>> getTaskStatusTransitions() {
        return ResponseUtil.success(
                taskStatusService.findAllTaskStatusTransitionByFarm()
        );
    }

    @Operation(
            summary = "Cập nhật trạng thái Task",
            description = "API cho phép cập nhật trạng thái của một Task",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/status/{taskStatusId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskStatusHistoryResponse>> updateTaskStatus(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId,
            @PathVariable("taskStatusId") UUID taskStatusId
    ) {
        return ResponseUtil.success(
                taskStatusService.updateTaskStatus(planId, stageId, taskId, taskStatusId)
        );
    }
}
