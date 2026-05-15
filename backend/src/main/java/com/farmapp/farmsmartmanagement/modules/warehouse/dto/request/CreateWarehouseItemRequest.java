package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWarehouseItemRequest {
    @NotNull(message = "Vui lòng chọn vị trí trong kho")
    UUID toLocationId;

    @NotNull(message = "Đơn vị không được để trống")
    UUID unitId;

    @Sanitize
    @NotBlank(message = "Tên vật tư không được để trống")
    @Size(max = 200)
    String name;

    @NotNull(message = "Số lượng vật tư không được để trống")
    @Min(value = 0,message = "Số lượng vật tư không thể âm")
    BigDecimal stock;

    @NotNull(message = "Mã vật tư không được để trống")
    @Size(max = 100)
    String sku;

    @Digits(integer = 13, fraction = 2, message = "Đơn giá mua vượt giá trị lưu trữ")
    @Min(value = 0,message = "Đơn giá mua không thể âm")
    BigDecimal unitPrice;

    UUID supplierId;

    @Digits(integer = 10, fraction = 3, message = "Tồn kho tối thiểu vượt giá trị lưu trữ")
    @Min(value = 0,message = "Đơn giá mua không thể âm")
    BigDecimal minStockQty;

}
