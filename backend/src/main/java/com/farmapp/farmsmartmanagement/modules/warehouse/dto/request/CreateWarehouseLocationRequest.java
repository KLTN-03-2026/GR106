package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWarehouseLocationRequest {

    @Size(max = 50, message = "Độ dài mã vị trí vượt quá giới hạn")
            @NotNull(message = "Vui lòng nhập mã vị trí trong kho")
    String code;

    @Sanitize
    @NotBlank(message = "Vui lòng nhập tên vị trí trong kho")
    String name;

    @Sanitize
    String description;

    @NotNull(message = "Vui lòng chọn trạng thái vị trí đóng/mở")
    Boolean isActive;
}
