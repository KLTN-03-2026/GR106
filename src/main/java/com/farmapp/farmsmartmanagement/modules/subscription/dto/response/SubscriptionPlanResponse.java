package com.farmapp.farmsmartmanagement.modules.subscription.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanResponse {

    private UUID id;
    private String name;

    private BigDecimal priceMonthly;
    private BigDecimal priceAnnual;

    private Short maxPlots;
    private Short maxMembers;

    private Boolean hasAiDiagnosis;
    private Boolean hasPdfExport;
    private Boolean hasMap;

    private String description;
}