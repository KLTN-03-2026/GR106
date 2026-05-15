package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SkuResponse {
    String sku;
    String description;
    Instant createdAt;
}
