package com.farmapp.farmsmartmanagement.modules.task.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;


@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTaskTimeRequest {

    @NotNull(message = "Version không được để trống")
    Long version;

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
