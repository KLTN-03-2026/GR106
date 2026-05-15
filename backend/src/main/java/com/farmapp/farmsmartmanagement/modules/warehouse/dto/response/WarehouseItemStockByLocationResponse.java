package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseItemStockByLocationResponse {

    // ── Location ──────────────────────────────────────────────────────────
    UUID locationId;
    String locationCode;
    String locationName;

    // ── Warehouse ─────────────────────────────────────────────────────────
    UUID warehouseId;
    String warehouseName;

    // ── Stock ─────────────────────────────────────────────────────────────
    BigDecimal qtyOnHand;
    String unit; // tên đơn vị (kg, cái, lít...)
}