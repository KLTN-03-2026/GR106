package com.farmapp.farmsmartmanagement.modules.warehouse.dto.response;


import lombok.AccessLevel;
import lombok.Data;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseResponse {
    UUID id;
    String name;
    String description;

    String address;
    BigDecimal latitude;
    BigDecimal longitude;
}
