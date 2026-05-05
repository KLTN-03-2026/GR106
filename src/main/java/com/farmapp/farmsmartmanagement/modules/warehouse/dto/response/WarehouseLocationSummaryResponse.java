package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseLocationSummaryResponse {

    UUID id;
    String code;
    String name;
    String description;
    Boolean isActive;

}
