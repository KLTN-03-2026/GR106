package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseItemResponse {
    UUID id;
    String name;

    BigDecimal stock;

    WarehouseResponse warehouse;

    UnitResponse unit;

    SupplierResponse supplier;

    SkuResponse sku;

    UserResponse createdBy; // -> Sau này chuyển sang UserSummaryResponse

    Instant createdAt;

}
