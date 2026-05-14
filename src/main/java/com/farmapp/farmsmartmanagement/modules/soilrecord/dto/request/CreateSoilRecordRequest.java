package com.farmapp.farmsmartmanagement.modules.soilrecord.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateSoilRecordRequest {
    @NotNull(message = "Vui lòng nhập ngày lấy mẫu")
    LocalDate sampledAt;

    @DecimalMin(value = "0.0", message = "Độ ph phải lớn hơn hoặc bằng 0")
    @DecimalMax(value = "14.0", message = "Độ ph phải nhỏ hơn hoặc bằng 14")
    @Digits(integer = 2, fraction = 2, message = "Số ph không hợp lệ (Ví dụ : 7.5)")
    BigDecimal ph;


    @DecimalMin(value = "0.0", message = "Nitrogen Mg Kg phải >= 0")
    @Digits(integer = 6, fraction = 2, message = "Số Nitrogen Mg Kg không hợp lệ (Ví dụ: 999999.99)")
    BigDecimal nitrogenMgKg;

    @DecimalMin(value = "0.0", message = "Phosphorus Mg Kg phải >= 0")
    @Digits(integer = 6, fraction = 2, message = "Số Phosphorus Mg Kg không hợp lệ (Ví dụ: 999999.99)")
    BigDecimal phosphorusMgKg;

    @DecimalMin(value = "0.0", message = "Potassium Mg Kg phải >= 0")
    @Digits(integer = 6, fraction = 2, message = "Số Potassium Mg Kg không hợp lệ (Ví dụ: 999999.99)")
    BigDecimal potassiumMgKg;

    @DecimalMin(value = "0.0", message = "Độ ẩm phải >= 0")
    @DecimalMax(value = "100.0", message = "Độ ẩm phải <= 100")
    @Digits(integer = 5, fraction = 2, message = "Số Moisture Percent không hợp lệ (Ví dụ: 99999.99)")
    BigDecimal moisturePercent;


    String sourceFileUrl;

    String notes;

}
