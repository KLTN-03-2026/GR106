package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseItemSummaryResponse {
    UUID id;

    String name;

    BigDecimal unitPrice;

    UnitResponse unit;

    Instant createdAt;
}
