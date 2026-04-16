package com.farmapp.farmsmartmanagement.modules.plan.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreateTaskRequest;
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
import org.springframework.web.bind.annotation.*;

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
                taskService.createTask(stageId, request)
        );
    }
}