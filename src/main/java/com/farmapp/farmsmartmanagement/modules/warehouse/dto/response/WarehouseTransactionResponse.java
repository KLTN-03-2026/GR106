package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
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
public class WarehouseTransactionResponse {
    UUID id;

    WarehouseItemSummaryResponse warehouseItem;

    WarehouseLocationSummaryResponse fromLocation;
    WarehouseLocationSummaryResponse toLocation;

    WarehouseTxnType type;

    BigDecimal qtyChange;

    UUID refTransferId;
    UUID refWorkLogId;
    UUID refTaskId;
    UUID refHavestId;

    UserResponse performedBy;

    String notes;

    Instant createdAt;


}
