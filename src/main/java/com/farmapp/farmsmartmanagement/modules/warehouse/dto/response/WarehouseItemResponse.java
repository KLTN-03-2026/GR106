package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseItemResponse {
    UUID id;
    String name;
    Long version;
    BigDecimal stock;

    BigDecimal reservedQty;

    BigDecimal unitPrice;

    WarehouseResponse warehouse;

    UnitResponse unit;

    SupplierResponse supplier;

    SkuResponse sku;

    UserResponse createdBy; // -> Sau này chuyển sang UserSummaryResponse

    Instant createdAt;

}
