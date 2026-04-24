package com.farmapp.farmsmartmanagement.modules.plan.service.task;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.TaskMaterialEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.plan.dto.request.CreateTaskMaterialRequest;
import com.farmapp.farmsmartmanagement.modules.plan.dto.response.TaskMaterialResponse;
import com.farmapp.farmsmartmanagement.modules.plan.mapper.TaskMaterialMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

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

    public TaskMaterialResponse createTaskMaterial(UUID planId, UUID stageId, UUID taskId, CreateTaskMaterialRequest request) {

        UUID farmId = securityUtils.getCurrentFarmId();

        TaskEntity task = taskRepository
                .findByIdAndStageIdAndPlanId(taskId,stageId,planId)
                .orElseThrow(()->new AppException(ErrorCode.TASK_NOT_FOUND));

        WarehouseItemEntity warehouseItem = null;
        if(request.getWarehouseItemId()!=null){
            warehouseItem = warehouseItemRepository
                    .findByIdAndFarmId(request.getWarehouseItemId(), farmId)
                    .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

            if(taskMaterialRepository.existsByTask_IdAndWarehouseItem_Id(task.getId(), request.getWarehouseItemId()))
                throw new AppException(ErrorCode.TASK_IS_TERMINAL);
        }

        if(task.getStatus().getIsTerminal().equals(true))
            throw new AppException(ErrorCode.TASK_IS_TERMINAL);


        // Cần phải kiểm tra số lượng vật tư dự kiến
        // work_log_material JOIN work_logs JOIN tasks -> SUM used_qty
        // task_materials -> SUM planned_qty
        // planned_qty - used_qty = hover_qty
        // lấy số lượng warehouse_items - hover_qty = available_qty
        // Nếu available_qty > request.getPlanned_qty() =>>>> CREATE // ELSE =>> THROW ERR

        TaskMaterialEntity taskMaterial = new TaskMaterialEntity();
        taskMaterial.setTask(task);
        taskMaterial.setWarehouseItem(warehouseItem);
        taskMaterial.setPlannedQty(request.getPlannedQty());

        return taskMaterialMapper.toResponse(taskMaterialRepository.save(taskMaterial));
    }



}
