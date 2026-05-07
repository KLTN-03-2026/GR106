package com.farmapp.farmsmartmanagement.modules.worksession.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdjustCheckoutRequest {

    @NotNull(message = "Giờ check-out thực tế không được để trống")
    Instant actualCheckoutAt;

    @NotBlank(message = "Lý do điều chỉnh không được để trống")
    String adjustReason;
}