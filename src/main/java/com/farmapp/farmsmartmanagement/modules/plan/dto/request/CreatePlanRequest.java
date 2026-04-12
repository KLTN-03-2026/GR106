package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePlanRequest {

    @Sanitize
    @NotBlank(message = "Tên kế hoạch không được để trống")
    String name;

}
