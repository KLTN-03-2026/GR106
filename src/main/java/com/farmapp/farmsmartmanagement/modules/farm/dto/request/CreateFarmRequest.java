package com.farmapp.farmsmartmanagement.modules.farm.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateFarmRequest {
    @NotBlank(message = "Tên trang trại không được để trống")
    String farmName;

    String description;
}
