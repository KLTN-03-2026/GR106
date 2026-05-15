package com.farmapp.farmsmartmanagement.modules.farm.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateFarmConfigRequest {

    @NotNull(message = "Version không được để trống")
    private Long version;

    @Size(max = 50, message = "Timezone không được vượt quá 50 ký tự")
    private String timezone;

    @Size(max = 10, message = "Locale không được vượt quá 10 ký tự")
    private String locale;

    @Size(max = 3, message = "Currency không được vượt quá 3 ký tự")
    private String currency;

    private Boolean allowCropClone;

    @Min(value = 1, message = "Số ngày thông báo quá hạn phải lớn hơn 0")
    @Max(value = 30, message = "Số ngày thông báo quá hạn không được vượt quá 30")
    private Short taskOverdueNotifyDays;
}
