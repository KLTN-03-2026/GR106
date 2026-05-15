package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWarehouseRequest {

    @Sanitize
    @NotBlank(message = "Tên kho không được để trống")
    String name;

    @Sanitize
    String description;

    @Sanitize
    String address;

    @DecimalMin(value = "-90.0",message = "Giá trị toạ độ không hợp lệ")
    @DecimalMax(value = "90.0", message = "Giá trị toạ độ không hợp lệ")
    @Digits(integer = 3, fraction = 6)
    BigDecimal latitude;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Digits(integer = 3, fraction = 6)
    BigDecimal longitude;

}
