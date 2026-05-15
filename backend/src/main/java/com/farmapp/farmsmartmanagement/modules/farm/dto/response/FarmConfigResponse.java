package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class FarmConfigResponse {
    private UUID farmId;
    private Long version;
    private String timezone;
    private String locale;
    private String currency;
    private Boolean allowCropClone;
    private Short taskOverdueNotifyDays;
    private Instant createdAt;
    private Instant updatedAt;
}