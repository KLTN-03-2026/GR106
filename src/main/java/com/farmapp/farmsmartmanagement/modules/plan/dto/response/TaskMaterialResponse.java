package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TaskMaterialResponse {
    UUID id;
    BigDecimal plannedQty;
    TaskSummaryResponse task;
    WarehouseItemSummaryResponse warehouseItem;
}
