package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AccessLevel;
import lombok.Data;

import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateWarehouseRequest {
    String name;
    String description;
    String address;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Digits(integer = 3, fraction = 6)
    BigDecimal latitude; // null thì sẽ bỏ qua các annotation trên

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Digits(integer = 3, fraction = 6)
    BigDecimal longitude;
}
