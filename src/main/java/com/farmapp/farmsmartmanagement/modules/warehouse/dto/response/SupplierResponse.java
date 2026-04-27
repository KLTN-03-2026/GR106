package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupplierResponse {
    UUID id;
    String code;
    String name;
    Instant createdAt;
}
