package com.farmapp.farmsmartmanagement.modules.subscription.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CancelSubscriptionRequest {

    @NotNull
    private UUID farmId;

    private String reason;
}