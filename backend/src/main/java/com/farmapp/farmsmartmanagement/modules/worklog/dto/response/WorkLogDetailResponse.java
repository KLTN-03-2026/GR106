package com.farmapp.farmsmartmanagement.modules.worklog.dto.response;
import com.farmapp.farmsmartmanagement.domain.enums.WorkLogType;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class WorkLogDetailResponse {
    UUID id;
    UUID taskId;
    String taskName;
    UUID employeeId;
    String employeeName;
    LocalDate workDate;
    String shiftName;
    WorkLogType type;
    boolean isOvertime;
    String notes;
    Instant lockedAt;
    Instant createdAt;
    List<WorkLogMaterialResponse> materials; // vật tư đã dùng

    @Data
    @Builder
    public static class WorkLogMaterialResponse {
        UUID warehouseItemId;
        String warehouseItemName;
        BigDecimal usedQty;
        String unitCode;
        String deviationReason;
    }
}