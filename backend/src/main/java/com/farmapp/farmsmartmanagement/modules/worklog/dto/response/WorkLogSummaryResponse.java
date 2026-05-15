package com.farmapp.farmsmartmanagement.modules.worklog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
public class WorkLogSummaryResponse {
    UUID employeeId;
    String employeeName;
    Long totalWorkDays;        // tổng số ngày công
    Long totalOvertimeDays;    // tổng số ngày OT
    BigDecimal totalWage;      // tổng lương
}