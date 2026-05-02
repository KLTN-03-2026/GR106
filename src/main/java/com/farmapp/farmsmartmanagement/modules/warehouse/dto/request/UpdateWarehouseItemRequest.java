package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateWarehouseItemRequest {

    @Sanitize
    @Size(max = 200, message = "Tên không được vượt quá 200 ký tự")
    private String name;

    @NotNull(message = "Version không được để trống")
    Long version;

    @Size(max = 100, message = "SKU không được vượt quá 100 ký tự")
    String sku;

    UUID unitId;

    UUID supplierId;  // null = xóa supplier

    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải lớn hơn 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tồn kho tối thiểu không được âm")
    @Digits(integer = 7, fraction = 3)
    private BigDecimal minStockQty;
}