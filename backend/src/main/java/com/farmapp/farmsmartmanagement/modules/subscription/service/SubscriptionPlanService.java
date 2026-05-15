package com.farmapp.farmsmartmanagement.modules.subscription.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmSubscriptionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.FarmSubscriptionResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.mapper.SubscriptionMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubscriptionPlanService {
    SubscriptionPlanRepository subscriptionPlanRepository;
    SubscriptionMapper subscriptionMapper;

    FarmSubscriptionRepository farmSubscriptionRepository;
    FarmRepository farmRepository;


    public List<SubscriptionPlanResponse> findAll(){
        return subscriptionPlanRepository.findAll().stream().map(subscriptionMapper::toPlanResponse).toList();
    }


}
