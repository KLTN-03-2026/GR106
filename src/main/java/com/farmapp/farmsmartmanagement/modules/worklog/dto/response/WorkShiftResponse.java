package com.farmapp.farmsmartmanagement.modules.worklog.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class WorkShiftResponse {
    private UUID id;
    private UUID farmId;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal coefficient;
    private boolean isActive;
    private Instant createdAt;
}