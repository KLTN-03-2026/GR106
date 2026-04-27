package com.farmapp.farmsmartmanagement.modules.task.dto.request;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTaskMaterialRequest {
    @Digits(integer = 7, fraction = 3, message = "Giá trị không được vượt quá 9.999.999,999")
    @NotNull(message = "Vui lòng không để trống số vật tư dự kiến")
    @Positive(message = "Số vật tư dự kiến phải lớn hơn 0")
    BigDecimal plannedQty;

    UUID warehouseItemId;
}
