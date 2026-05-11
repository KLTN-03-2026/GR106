package com.farmapp.farmsmartmanagement.modules.worklog.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateEmployeeWageConfigRequest {

    @NotNull(message = "userId không được để trống")
    private UUID userId;

    @NotNull(message = "Lương ngày không được để trống")
    @DecimalMin(value = "0.01", message = "Lương ngày phải lớn hơn 0")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal dailyRate;

    @DecimalMin(value = "1.0", message = "Hệ số OT phải >= 1")
    @Digits(integer = 2, fraction = 2)
    private BigDecimal otMultiplier = new BigDecimal("1.5");

    @NotNull(message = "Ngày hiệu lực không được để trống")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @JsonIgnore
    @AssertTrue(message = "Ngày kết thúc phải sau ngày hiệu lực")
    private boolean isDateRangeValid() {
        if (effectiveFrom == null || effectiveTo == null) return true;
        return effectiveTo.isAfter(effectiveFrom);
    }
}