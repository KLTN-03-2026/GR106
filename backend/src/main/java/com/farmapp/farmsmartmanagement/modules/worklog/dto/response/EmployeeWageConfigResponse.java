package com.farmapp.farmsmartmanagement.modules.worklog.dto.response;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class EmployeeWageConfigResponse {
    private UUID id;
    private UUID farmId;
    private UUID userId;
    private String userFullName;
    private BigDecimal dailyRate;
    private BigDecimal otMultiplier;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Instant createdAt;
}

