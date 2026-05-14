package com.farmapp.farmsmartmanagement.modules.soilrecord.dto.response;

import com.farmapp.farmsmartmanagement.modules.plot.dto.response.PlotResponse;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SoilRecordResponse {
    UUID id;

    PlotResponse plot;

    LocalDate sampledAt;

    BigDecimal ph;

    BigDecimal nitrogenMgKg;

    BigDecimal phosphorusMgKg;

    BigDecimal potassiumMgKg;

    BigDecimal moisturePercent;

    String notes;
    String sourceFileUrl;

    Instant lockedAt;
    Instant createdAt;
}
