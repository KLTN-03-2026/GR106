package com.farmapp.farmsmartmanagement.modules.subscription.service;


import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.SubscriptionPlanResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.mapper.SubscriptionMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubscriptionService {
    SubscriptionPlanRepository subscriptionPlanRepository;
    SubscriptionMapper subscriptionMapper;

    public List<SubscriptionPlanResponse> findAll(){
        return subscriptionPlanRepository.findAll().stream().map(subscriptionMapper::toPlanResponse).toList();
    }

}
