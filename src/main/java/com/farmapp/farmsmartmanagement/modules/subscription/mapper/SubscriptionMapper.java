package com.farmapp.farmsmartmanagement.modules.subscription.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    // =========================
    // FarmSubscription -> Response
    // =========================
    @Mapping(source = "farm.id", target = "farmId")
    @Mapping(source = "plan.id", target = "planId")
    @Mapping(source = "plan.name", target = "planName")
    SubscriptionResponse toResponse(FarmSubscriptionEntity entity);

    // =========================
    // Plan -> Response
    // =========================
    SubscriptionPlanResponse toPlanResponse(SubscriptionPlanEntity entity);
}