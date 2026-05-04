package com.farmapp.farmsmartmanagement.modules.task.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskDependencyRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.CreateTaskDependencyResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskDependencyResponse;
import com.farmapp.farmsmartmanagement.modules.task.service.TaskDependencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Task Dependency API", description = "Quản lý quan hệ phụ thuộc giữa các Task")
public class TaskDependencyController {

    TaskDependencyService taskDependencyService;

    @Operation(
            summary = "Tạo quan hệ phụ thuộc giữa các Task",
            description = "API cho phép tạo dependency giữa một Task và Task khác trong cùng giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/dependencies")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<CreateTaskDependencyResponse>> createTaskDependency(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId,
            @RequestBody @Valid CreateTaskDependencyRequest request
    ) {
        return ResponseUtil.created(
                taskDependencyService.createTaskDependency(
                        planId, stageId, taskId, request
                )
        );
    }

    @Operation(
            summary = "Lấy danh sách dependency của một Task",
            description = "API cho phép lấy tất cả các Task mà Task hiện tại phụ thuộc vào",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/tasks/{taskId}/dependencies")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskDependencyResponse>> getAllTaskDependencies(
            @PathVariable("taskId") UUID taskId
    ) {
        return ResponseUtil.success(
                taskDependencyService.getAllTaskDependencyByTaskId(taskId)
        );
    }

    @Operation(
            summary = "Xoá quan hệ phụ thuộc",
            description = "API cho phép xoá dependency giữa một Task và Task khác",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/api/v1/tasks/{taskId}/dependencies/{dependsOnTaskId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteTaskDependency(
            @PathVariable("taskId") UUID taskId,
            @PathVariable("dependsOnTaskId") UUID dependsOnTaskId
    ) {
        taskDependencyService.deleteTaskDependency(taskId, dependsOnTaskId);
        return ResponseUtil.noContent();
    }
}
