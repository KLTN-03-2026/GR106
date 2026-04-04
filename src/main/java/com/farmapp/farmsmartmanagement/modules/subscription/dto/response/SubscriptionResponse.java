package com.farmapp.farmsmartmanagement.modules.subscription.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {

    private UUID id;
    private UUID farmId;

    private UUID planId;
    private String planName;

    private SubscriptionStatus status;
    private BillingCycle billingCycle;

    private Boolean isCurrent;

    private Instant startedAt;
    private Instant expiresAt;
    private Instant graceUntil;

    private Boolean autoRenew;
}