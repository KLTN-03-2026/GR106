package com.farmapp.farmsmartmanagement.modules.worklog.dto.request;

import com.farmapp.farmsmartmanagement.domain.enums.WorkLogType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWorkLogRequest {

    @NotNull(message = "Ngày làm việc không được để trống")
    LocalDate workDate;

    UUID shiftId;

    @NotNull(message = "Loại work log không được để trống")
    WorkLogType type;

    boolean isOvertime = false;

    String notes;

    @Valid
    List<WorkLogMaterialRequest> materials; // nullable — không bắt buộc dùng vật tư

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkLogMaterialRequest {

        @NotNull(message = "Vật tư không được để trống")
        UUID warehouseItemId;

        @NotNull(message = "Vị trí lấy hàng không được để trống")
        UUID fromLocationId;  // ← thêm mới

        @NotNull(message = "Số lượng không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Số lượng phải lớn hơn 0")
        @Digits(integer = 7, fraction = 3)
        BigDecimal usedQty;

        String deviationReason;
    }

    @JsonIgnore
    @AssertTrue(message = "Ngày làm việc không được là ngày tương lai")
    private boolean isWorkDateValid() {
        if (workDate == null) return true;
        return !workDate.isAfter(LocalDate.now());
    }

    @JsonIgnore
    @AssertTrue(message = "MAKEUP phải có overtime = true")
    private boolean isMakeupValid() {
        if (type == null) return true;
        if (type == WorkLogType.MAKEUP) return isOvertime;
        return true;
    }
}