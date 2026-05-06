package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePlanStageFromTemplateRequest {
    @NotNull(message = "Vui lòng chọn giai đoạn của cây")
    UUID cropStageId;

    @NotNull(message = "Vui lòng chọn ngày bắt đầu")
    LocalDate startDate;
}
