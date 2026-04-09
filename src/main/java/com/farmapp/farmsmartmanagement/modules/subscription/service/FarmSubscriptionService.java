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

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmSubscriptionService {
    SubscriptionPlanRepository subscriptionPlanRepository;
    SubscriptionMapper subscriptionMapper;

    FarmSubscriptionRepository farmSubscriptionRepository;
    FarmRepository farmRepository;

    public List<FarmSubscriptionResponse> getFarmSubscriptionHistory(UUID farmId){
        return farmSubscriptionRepository.findByFarm_Id(farmId)
                .stream()
                .map(subscriptionMapper::toFarmSubscriptionResponse)
                .toList();
    }

    public FarmSubscriptionResponse getCurrentFarmSubscription(UUID farmId){

        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        FarmSubscriptionEntity farmSubscription = farmSubscriptionRepository.findByFarmAndIsCurrent(farm, true)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        return subscriptionMapper.toFarmSubscriptionResponse(farmSubscription);
    }

    public void activateSubscription(PaymentTransactionEntity txn) {

        FarmSubscriptionEntity currentSubscriptionPlan = farmSubscriptionRepository
                .findByFarmAndIsCurrent(txn.getFarm(), true)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        SubscriptionPlanEntity defaultSubscription = subscriptionPlanRepository.findByName("FREE")
                .orElseThrow(() -> new AppException(ErrorCode.DEFAULT_SUBSCRIPTION_PLAN_NOT_FOUND));

        SubscriptionPlanEntity nextSubscriptionPlan = txn.getSubscriptionPlan();

        SubscriptionHistoryEntity subscriptionHistory = new  SubscriptionHistoryEntity();
        subscriptionHistory.setFarmSubscription(currentSubscriptionPlan);
        subscriptionHistory.setFromPlan(currentSubscriptionPlan.getSubscriptionPlan());
        subscriptionHistory.setToPlan(txn.getSubscriptionPlan());
        subscriptionHistory.setTriggeredBy(txn.getUser());
        subscriptionHistory.setFarm(txn.getFarm());
        subscriptionHistory.setCreatedAt(Instant.now());

        FarmSubscriptionEntity nextFarmSubscription = txn.getFarmSubscription();


        // Trường hợp gói hiện tại thấp hơn
        if(txn.getSubscriptionPlan().getPriceMonthly().compareTo(currentSubscriptionPlan.getSubscriptionPlan().getPriceMonthly()) > 0){
            subscriptionHistory.setEventType("UPGRADE");

            //Tắt gói hiện tại -> nâng cấp lên gói mới
            currentSubscriptionPlan.setIsCurrent(false);
            currentSubscriptionPlan.setCancelledAt(Instant.now());
            currentSubscriptionPlan.setCancellationReason("UPGRADE");
            currentSubscriptionPlan.setUpdatedAt(Instant.now());

            nextFarmSubscription.setIsCurrent(true);

            nextFarmSubscription.setNextPlan(defaultSubscription);
        }

        //Trường hợp gói hiện tại thấp hơn
        else{
            subscriptionHistory.setEventType("DOWNGRADE");
            currentSubscriptionPlan.setNextPlan(nextSubscriptionPlan);

            nextFarmSubscription.setNextPlan(defaultSubscription);
            nextFarmSubscription.setStatus(SubscriptionStatus.ACTIVE);
            nextFarmSubscription.setIsCurrent(false);
            nextFarmSubscription.setCreatedAt(Instant.now());
            nextFarmSubscription.setStartedAt(currentSubscriptionPlan.getGraceUntil());
            nextFarmSubscription.setExpiresAt(nextFarmSubscription.getBillingCycle().compareTo(BillingCycle.MONTHLY) > 1 ?
                    currentSubscriptionPlan.getGraceUntil().plus(30, ChronoUnit.DAYS)
                    : nextFarmSubscription.getGraceUntil().plus(1, ChronoUnit.YEARS));
            nextFarmSubscription.setGraceUntil(nextFarmSubscription.getBillingCycle().compareTo(BillingCycle.MONTHLY) > 1 ?
                    currentSubscriptionPlan.getGraceUntil().plus(31, ChronoUnit.DAYS)
                    :currentSubscriptionPlan.getGraceUntil().plus(366, ChronoUnit.DAYS));
        }





        SubscriptionHistoryEntity newHistory = new SubscriptionHistoryEntity();
        newHistory.setEventType("UP");



    }
}
