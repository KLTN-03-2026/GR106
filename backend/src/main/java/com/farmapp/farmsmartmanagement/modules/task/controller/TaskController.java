package com.farmapp.farmsmartmanagement.modules.task.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.PageResponse;
import com.farmapp.farmsmartmanagement.common.response.PageableResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.UpdateTaskTimeRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskResponse;
import com.farmapp.farmsmartmanagement.modules.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskByIdAndPlanStageIdAndPlanId(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable UUID taskId
    ){
        return ResponseUtil.success(
                taskService.findByIdAndPlanStageIdAndPlanId(taskId,stageId,planId)
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

    @Operation(
            summary = "Lấy task được gắn hôm nay",
            description = "API trả về danh sách công việc được assign cho user trong ngày hôm nay",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/tasks/assigned/today")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAssignedTasksForToday(
            @RequestParam("userId") UUID userId
    ){
        return ResponseUtil.success(
                taskService.findAssignedTasksForToday(userId)
        );
    }


    @Operation(
            summary = "Lấy task được gắn theo user (Pageable)",
            description = "API trả về danh sách công việc được assign cho user, có phân trang",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/tasks/assigned")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PageableResponse<TaskResponse>>> getAssignedTasks(
            @RequestParam("userId") UUID userId,
            Pageable pageable
    ){
        return ResponseUtil.success(
                taskService.findAssignedTasks(userId, pageable)
        );
    }


    @Operation(
            summary = "Lấy task được gắn theo ngày (Pageable)",
            description = "API trả về danh sách công việc được assign cho user theo ngày cụ thể, có phân trang",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/tasks/assigned/by-date")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PageableResponse<TaskResponse>>> getAssignedTasksByDate(
            @RequestParam("userId") UUID userId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable
    ){
        return ResponseUtil.success(
                taskService.findAssignedTasksByDate(userId, date, pageable)
        );
    }


}