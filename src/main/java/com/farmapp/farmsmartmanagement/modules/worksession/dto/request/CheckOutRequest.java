package com.farmapp.farmsmartmanagement.modules.worksession.dto.request;

import com.farmapp.farmsmartmanagement.domain.enums.WorkLogType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckOutRequest {

    // ── Session ──────────────────────────────────────────────────────────────

    String checkOutNote;

    // ── WorkLog ──────────────────────────────────────────────────────────────

    UUID shiftId;

    @NotNull(message = "Loại work log không được để trống")
    WorkLogType type;

    boolean isOvertime = false;

    String notes;

    // ── Vật tư (tuỳ chọn) ────────────────────────────────────────────────────

    @Valid
    List<WorkLogMaterialRequest> materials;

    // ── Nested DTO ────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkLogMaterialRequest {

        @NotNull(message = "Vật tư không được để trống")
        UUID warehouseItemId;

        @NotNull(message = "Vị trí lấy hàng không được để trống")
        UUID fromLocationId;

        @NotNull(message = "Số lượng không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Số lượng phải lớn hơn 0")
        @Digits(integer = 7, fraction = 3)
        BigDecimal usedQty;

        String deviationReason;
    }

    // ── Cross-field validation ────────────────────────────────────────────────

    @JsonIgnore
    @AssertTrue(message = "MAKEUP phải có overtime = true")
    public boolean isMakeupValid() {
        if (type == null) return true;
        if (type == WorkLogType.MAKEUP) return isOvertime;
        return true;
    }
}