package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SkuResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.UnitResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class WarehouseItemSummaryResponse {
    UUID id;
    String name;
    SkuResponse sku;
    UnitResponse unit;
}
