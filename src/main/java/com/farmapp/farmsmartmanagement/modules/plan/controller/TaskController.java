package com.farmapp.farmsmartmanagement.modules.plan.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.UpdateTaskTimeRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.plan.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Task API", description = "Quản lý công việc (Task) trong giai đoạn kế hoạch")
public class TaskController {

    TaskService taskService;

    @Operation(
            summary = "Tạo TASK mới",
            description = "API cho phép tạo công việc trong một giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @RequestBody @Valid CreateTaskRequest request
    ){
        return ResponseUtil.created(
                taskService.createTask(planId, stageId, request)
        );
    }


    @Operation(
            summary = "Cập nhật TASK ",
            description = "API cho phép cập nhật công việc công việc trong một giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId,
            @RequestBody @Valid UpdateTaskRequest request
    ){
        return ResponseUtil.success(
                taskService.updateTask(planId, stageId, taskId, request)
        );
    }

    @Operation(
            summary = "Cập nhật TASK ",
            description = "API cho phép cập nhật công việc công việc trong một giai đoạn kế hoạch",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/time")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskTime(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId,
            @RequestBody @Valid UpdateTaskTimeRequest request
    ){
        return ResponseUtil.success(
                taskService.updateTaskTime(planId, stageId, taskId, request)
        );
    }

    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByStage(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId
    ){
        return ResponseUtil.success(
                taskService.findAllByPlanStageId(stageId)
        );
    }


    @DeleteMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId
    ){
        taskService.deleteTask(taskId);
        return ResponseUtil.noContent();
    }

}