package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePlanStageRequest {
    @Sanitize
    @NotBlank(message = "Tên giai đoạn không được để trống")
    String name;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    LocalDate startDate;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    LocalDate endDate;


    @JsonIgnore
    @AssertTrue(message = "Thời gian bắt đầu phải trước thời gian kết thúc")
    private boolean isDateRangeValid() {
        if (startDate == null || endDate == null) return true;
        return !startDate.isAfter(endDate);
    }

    @JsonIgnore
    @AssertTrue(message = "Thời gian kết thúc không được nằm trong quá khứ")
    private boolean isEndDateValid() {
        if (endDate == null) return true;
        return !endDate.isBefore(LocalDate.now());
    }
}
