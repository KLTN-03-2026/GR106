package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateSkuRequest {
    String sku;
    String description;
}
