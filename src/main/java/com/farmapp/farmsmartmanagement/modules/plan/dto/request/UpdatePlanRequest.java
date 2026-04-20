package com.farmapp.farmsmartmanagement.modules.plan.dto.request;


import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdatePlanRequest {
    @Sanitize
    String name;

    LocalDate startDate;
    LocalDate endDate;

    @Sanitize
    String note;

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

    @JsonIgnore
    @AssertTrue(message = "Thời gian bắt đầu và kết thúc phải cùng tồn tại")
    private boolean isTimeHaveBothEndAndStart() {
        return (startDate == null) == (endDate == null);
    }
}
