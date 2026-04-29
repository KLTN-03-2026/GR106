package com.farmapp.farmsmartmanagement.modules.task.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;

import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskMaterialRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskMaterialResponse;
import com.farmapp.farmsmartmanagement.modules.task.service.TaskMaterialService;
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
@Tag(name = "Task Material API", description = "Quản lý vật tư gắn với Task")
public class TaskMaterialController {

    TaskMaterialService taskMaterialService;

    // Thêm vật tư vào task
    @PostMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials")
    @RequiresFarmToken
    @Operation(summary = "Thêm vật tư cho Task", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<TaskMaterialResponse>> create(
            @PathVariable UUID planId,
            @PathVariable UUID stageId,
            @PathVariable UUID taskId,
            @RequestBody @Valid CreateTaskMaterialRequest request
    ) {
        return ResponseUtil.created(
                taskMaterialService.createTaskMaterial(planId, stageId, taskId, request)
        );
    }

    // Lấy danh sách vật tư của task
    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials")
    @RequiresFarmToken
    @Operation(summary = "Danh sách vật tư của Task", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<TaskMaterialResponse>>> getAll(
            @PathVariable UUID planId,
            @PathVariable UUID stageId,
            @PathVariable UUID taskId
    ) {
        return ResponseUtil.success(
                taskMaterialService.findAllByTaskId(taskId)
        );
    }
//
//    // Cập nhật số lượng vật tư
//    @PatchMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials/{materialId}")
//    @RequiresFarmToken
//    @Operation(summary = "Cập nhật vật tư của Task", security = @SecurityRequirement(name = "bearerAuth"))
//    public ResponseEntity<ApiResponse<TaskMaterialResponse>> update(
//            @PathVariable UUID planId,
//            @PathVariable UUID stageId,
//            @PathVariable UUID taskId,
//            @PathVariable UUID materialId,
//            @RequestBody @Valid UpdateTaskMaterialRequest request
//    ) {
//        return ResponseUtil.success(
//                taskMaterialService.updateTaskMaterial(taskId, materialId, request)
//        );
//    }
//
    // Xóa vật tư khỏi task
    @DeleteMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials/{materialId}")
    @RequiresFarmToken
    @Operation(summary = "Xóa vật tư khỏi Task", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID planId,
            @PathVariable UUID stageId,
            @PathVariable UUID taskId,
            @PathVariable UUID materialId
    ) {
        taskMaterialService.deleteTaskMaterial(taskId, materialId);
        return ResponseUtil.noContent();
    }
}