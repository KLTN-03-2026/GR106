package com.farmapp.farmsmartmanagement.modules.subscription.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.PaymentResultResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.dto.response.FarmSubscriptionResponse;
import com.farmapp.farmsmartmanagement.modules.subscription.mapper.SubscriptionMapper;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmSubscriptionService {
    SubscriptionPlanRepository subscriptionPlanRepository;
    SubscriptionMapper subscriptionMapper;
    SubscriptionHistoryRepository subscriptionHistoryRepository;

    FarmSubscriptionRepository farmSubscriptionRepository;
    FarmRepository farmRepository;

    PaymentTransactionRepository paymentTransactionRepository;

    EntityManager entityManager;

    SecurityUtils securityUtils;
//
//    public FarmSubscriptionResponse

    @Transactional
    @PreAuthorize("hasAuthority('subscription:manage')")
    public List<FarmSubscriptionResponse> getFarmSubscriptionHistory(UUID farmId){
        return farmSubscriptionRepository.findByFarm_Id(farmId)
                .stream()
                .map(subscriptionMapper::toFarmSubscriptionResponse)
                .toList();
    }

    @Transactional
    public FarmSubscriptionResponse getCurrentFarmSubscription(UUID farmId){

        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        FarmSubscriptionEntity farmSubscription = farmSubscriptionRepository.findByFarmAndIsCurrent(farm, true)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        return subscriptionMapper.toFarmSubscriptionResponse(farmSubscription);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void activateSubscription(PaymentTransactionEntity txn) {

        entityManager.createNativeQuery("SET LOCAL app.bypass_rls = 'true'").executeUpdate();

        FarmSubscriptionEntity current = farmSubscriptionRepository
                .findCurrentByFarmIdForUpdate(txn.getFarm().getId())
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        SubscriptionPlanEntity defaultPlan = subscriptionPlanRepository.findByName("FREE")
                .orElseThrow(() -> new AppException(ErrorCode.DEFAULT_SUBSCRIPTION_PLAN_NOT_FOUND));

        SubscriptionPlanEntity newPlan = txn.getSubscriptionPlan();

        // Xác định event type
        int priceCompare = newPlan.getPriceMonthly()
                .compareTo(current.getSubscriptionPlan().getPriceMonthly());
        String eventType = priceCompare > 0 ? "UPGRADED"
                : priceCompare < 0 ? "DOWNGRADED"
                : "RENEWED";

        log.info("[Subscription] eventType={} farm={} fromPlan={} toPlan={}",
                eventType, txn.getFarm().getId(),
                current.getSubscriptionPlan().getName(), newPlan.getName());

        // Tính thời gian — tiếp nối nếu gói hiện tại còn hạn
        Instant now = Instant.now();
        Instant newStart = (current.getExpiresAt() != null && current.getExpiresAt().isAfter(now))
                ? current.getExpiresAt()
                : now;

        boolean isYearly = txn.getBillingCycle() == BillingCycle.ANNUAL;
        Instant newExpires = isYearly
                ? newStart.plus(365, ChronoUnit.DAYS)
                : newStart.plus(30,  ChronoUnit.DAYS);
        Instant newGrace = isYearly
                ? newExpires.plus(7, ChronoUnit.DAYS)
                : newExpires.plus(3, ChronoUnit.DAYS);

        // Tạo FarmSubscription mới
        FarmSubscriptionEntity next = FarmSubscriptionEntity.builder()
                .farm(txn.getFarm())
                .subscriptionPlan(newPlan)
                .billingCycle(txn.getBillingCycle())
                .nextPlan(defaultPlan)
                .startedAt(newStart)
                .expiresAt(newExpires)
                .graceUntil(newGrace)
                .autoRenew(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        if ("UPGRADED".equals(eventType) || "RENEWED".equals(eventType)) {
            // Tắt gói hiện tại ngay
            current.setIsCurrent(false);
            current.setCancelledAt(now);
            current.setCancellationReason(eventType);
            current.setUpdatedAt(now);

            // Kích hoạt gói mới ngay
            next.setIsCurrent(true);
            next.setStatus(SubscriptionStatus.ACTIVE);

        } else { // DOWNGRADE
            // Gói hiện tại chạy đến hết hạn
            current.setNextPlan(newPlan);
            current.setUpdatedAt(now);

            // Gói mới chờ đến khi gói cũ hết hạn
            next.setIsCurrent(false);
            next.setStatus(SubscriptionStatus.PENDING);
        }

        // Ghi lịch sử
        SubscriptionHistoryEntity history = SubscriptionHistoryEntity.builder()
                .farm(txn.getFarm())
                .farmSubscription(current)
                .fromPlan(current.getSubscriptionPlan())
                .toPlan(newPlan)
                .triggeredBy(txn.getUser())
                .eventType(eventType)
                .createdAt(now)
                .build();

        farmSubscriptionRepository.save(current);
        farmSubscriptionRepository.flush();
        farmSubscriptionRepository.save(next);
        subscriptionHistoryRepository.save(history);

        log.info("[Subscription] DONE eventType={} farm={} plan={} start={} expires={}",
                eventType, txn.getFarm().getId(), newPlan.getName(), newStart, newExpires);
    }

    public PaymentResultResponse getPaymentResult(String orderCode){
        UUID userId =  securityUtils.getCurrentUserId();

        PaymentTransactionEntity paymentTransaction =
                paymentTransactionRepository
                        .findByOrderCodeAndUser_IdAndPaidAtIsNotNull(orderCode,userId)
                        .orElseThrow(()->new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        return subscriptionMapper.toPaymentResultResponse(paymentTransaction);

    }
}
