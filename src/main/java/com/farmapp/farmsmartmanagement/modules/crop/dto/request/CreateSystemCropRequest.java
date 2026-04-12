package com.farmapp.farmsmartmanagement.modules.crop.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class CreateSystemCropRequest {
    @Sanitize
    @NotBlank(message = "Tên cây trồng không được để trống")
    String name;

    @NotNull(message = "Loại cây trồng không được để trống")
    UUID cropTypeId;

    @Sanitize
    String description;

    String imageUrl;
}
