package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UnitResponse {
    UUID id;
    String code;
    String name;
}
