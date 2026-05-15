package com.farmapp.farmsmartmanagement.modules.crop.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateFarmCropRequest {

    @Sanitize
    @NotBlank(message = "Tên cây trồng không được để trống")
    String name;

    @NotNull(message = "Loại cây trồng không được để trống")
    UUID cropTypeId;

    @Sanitize
    String description;

    String imageUrl;

    // Chỉ dùng khi scope = FARM — clone từ SYSTEM crop
    UUID cloneFromId;
}
