package com.farmapp.farmsmartmanagement.modules.crop.dto.request;


import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCropTypeRequest {
    @Sanitize
    @NotBlank(message = "Tên loại cây trồng không được để trống")
    String name;

    @Sanitize
    String description;
}
