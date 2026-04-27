package com.farmapp.farmsmartmanagement.modules.task.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.task.dto.request.CreateTaskMaterialRequest;
import com.farmapp.farmsmartmanagement.modules.task.dto.response.TaskMaterialResponse;
import com.farmapp.farmsmartmanagement.modules.task.mapper.TaskMaterialMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskMaterialService {
    TaskMaterialRepository taskMaterialRepository;
    TaskRepository taskRepository;
    PlanRepository planRepository;
    PlanStageRepository planStageRepository;

    FarmRepository farmRepository;

    WarehouseRepository warehouseRepository;
    WarehouseItemRepository warehouseItemRepository;

    TaskMaterialMapper taskMaterialMapper;

    SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<TaskMaterialResponse> findAllByTaskId(UUID taskId) {
        return taskMaterialMapper.toResponses(taskMaterialRepository.findAllByTask_Id(taskId));
    }

    @Transactional
    public TaskMaterialResponse createTaskMaterial(UUID planId, UUID stageId, UUID taskId, CreateTaskMaterialRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanId(taskId,stageId,planId)
                .orElseThrow(()->new AppException(ErrorCode.TASK_NOT_FOUND));

        // Vật tư là nullable = true
        WarehouseItemEntity warehouseItem = null;
        if(request.getWarehouseItemId()!=null){
            warehouseItem = warehouseItemRepository
                    .findByIdAndFarm_Id(request.getWarehouseItemId(), farmId)
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

            if(taskMaterialRepository.existsByTask_IdAndWarehouseItem_Id(task.getId(), request.getWarehouseItemId()))
                throw new AppException(ErrorCode.TASK_IS_TERMINAL);
        }

        if(task.getStatus().getIsTerminal().equals(true))
            throw new AppException(ErrorCode.TASK_IS_TERMINAL);

        // Kiểm tra số lượng vật tư có đủ?
        boolean sufficient = warehouseItemRepository
                .isStockSufficientForPlanning(
                        request.getWarehouseItemId(),
                        farmId,
                        request.getPlannedQty()
                );

        if (!sufficient)
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK_FOR_PLAN);

        TaskMaterialEntity taskMaterial = new TaskMaterialEntity();
        taskMaterial.setTask(task);
        taskMaterial.setWarehouseItem(warehouseItem);
        taskMaterial.setPlannedQty(request.getPlannedQty());

        return taskMaterialMapper.toResponse(taskMaterialRepository.save(taskMaterial));
    }




}
