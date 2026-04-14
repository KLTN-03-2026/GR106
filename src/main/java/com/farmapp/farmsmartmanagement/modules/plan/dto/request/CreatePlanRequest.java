package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePlanRequest {

    @NotNull(message = "Chưa chọn cây trồng")
    UUID cropId;

    @Sanitize
    @NotBlank(message = "Tên kế hoạch không được để trống")
    String name;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    LocalDate startDate;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    LocalDate endDate;

    @Sanitize
    String note;

    @JsonIgnore
    @AssertTrue(message = "Thời gian bắt đầu phải trước thời gian kết thúc")
    private boolean isDateRangeValid() {
        if (startDate == null || endDate == null) return true;
        return startDate.isBefore(endDate);
    }

    @JsonIgnore
    @AssertTrue(message = "Thời gian kết thúc không được nằm trong quá khứ")
    private boolean isEndDateValid() {
        if (endDate == null) return true;
        return LocalDate.now().isBefore(endDate);
    }


}
