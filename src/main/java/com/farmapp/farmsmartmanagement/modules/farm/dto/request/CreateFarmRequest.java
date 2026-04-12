package com.farmapp.farmsmartmanagement.modules.farm.dto.request;


import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateFarmRequest {
    @Sanitize
    @NotBlank(message = "Tên trang trại không được để trống")
    String farmName;

    @Sanitize
    String description;
}
