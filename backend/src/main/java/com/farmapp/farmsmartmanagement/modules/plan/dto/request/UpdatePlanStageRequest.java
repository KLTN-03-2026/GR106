package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdatePlanStageRequest {
    String name;
    LocalDate startDate;
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
