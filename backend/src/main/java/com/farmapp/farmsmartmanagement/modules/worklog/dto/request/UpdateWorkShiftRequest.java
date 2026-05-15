package com.farmapp.farmsmartmanagement.modules.worklog.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class UpdateWorkShiftRequest {

    @Size(max = 100, message = "Tên ca làm việc không được vượt quá 100 ký tự")
    private String name;

    private LocalTime startTime;
    private LocalTime endTime;

    @DecimalMin(value = "0.01", message = "Hệ số phải lớn hơn 0")
    @DecimalMax(value = "1.0",  message = "Hệ số không được vượt quá 1.0")
    @Digits(integer = 2, fraction = 2)
    private BigDecimal coefficient;

    private Boolean isActive;

    @JsonIgnore
    @AssertTrue(message = "Giờ kết thúc phải sau giờ bắt đầu")
    private boolean isTimeRangeValid() {
        if (startTime == null || endTime == null) return true;
        return endTime.isAfter(startTime);
    }
}
