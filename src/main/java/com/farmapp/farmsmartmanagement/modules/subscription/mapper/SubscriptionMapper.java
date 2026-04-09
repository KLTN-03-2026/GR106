package com.farmapp.farmsmartmanagement.modules.subscription.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.FarmSubscriptionResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    // =========================
    // FarmSubscription -> Response
    // =========================
    @Mapping(source = "farm.id", target = "farmId")
    @Mapping(source = "subscriptionPlan.id", target = "subscriptionPlanId")
    @Mapping(source = "subscriptionPlan.name", target = "subscriptionPlanName")
    FarmSubscriptionResponse toFarmSubscriptionResponse(FarmSubscriptionEntity entity);

    // =========================
    // Plan -> Response
    // =========================
    SubscriptionPlanResponse toPlanResponse(SubscriptionPlanEntity entity);
}