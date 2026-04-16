package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NonNull;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskCreateRequest {


    @Sanitize
    @NotNull(message = "Tên công việc không được để trống")
    String name;

    @Sanitize
    String description;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    LocalDate startDate;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    LocalDate endDate;

    UUID plotId;



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
