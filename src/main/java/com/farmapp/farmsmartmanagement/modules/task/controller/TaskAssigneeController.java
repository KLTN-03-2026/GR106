package com.farmapp.farmsmartmanagement.modules.task.controller;


import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskAssigneeRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.DeleteTaskAssigneeRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.CreateTaskAssigneeResponse;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskAssigneeResponse;
import com.farmapp.farmsmartmanagement.modules.task.service.TaskAssigneeService;
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
public class TaskAssigneeController {

    TaskAssigneeService taskAssigneeService;

    @GetMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/assignees")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<TaskAssigneeResponse>>> getAllTaskAssignees(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId
    ){
        return ResponseUtil.success(
                taskAssigneeService.findAllAssignees(planId, stageId, taskId)
        );
    }

    @PostMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/assignees")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<CreateTaskAssigneeResponse>> createTaskAssignee(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId,
            @RequestBody @Valid CreateTaskAssigneeRequest request
    ){
        return ResponseUtil.created(
                taskAssigneeService.createTaskAssignee(planId, stageId, taskId, request)
        );
    }

    @DeleteMapping("/api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/assignees/{assigneeId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<TaskAssigneeResponse>> createTaskAssignee(
            @PathVariable("planId") UUID planId,
            @PathVariable("stageId") UUID stageId,
            @PathVariable("taskId") UUID taskId,
            @PathVariable("assigneeId") UUID assigneeId,
            @RequestBody @Valid DeleteTaskAssigneeRequest request
    ){

        return ResponseUtil.success(
                taskAssigneeService.deleteAssignee(planId, stageId, taskId, assigneeId,request)
        );
    }
}
