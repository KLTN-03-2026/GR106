package com.farmapp.farmsmartmanagement.modules.payment.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Kích hoạt hoặc gia hạn subscription sau khi thanh toán thành công.
 *
 * Flow:
 *  - Nếu farm chưa có subscription (TRIAL / không có) → tạo mới ACTIVE
 *  - Nếu farm đang có subscription ACTIVE → gia hạn (extend expires_at)
 *  - Nếu farm upgrade gói → mark cũ is_current=false, tạo mới
 *
 * Chạy trong transaction riêng (REQUIRES_NEW) để:
 *  - Không rollback payment nếu activation lỗi nghiệp vụ
 *  - Ghi subscription_history atomically cùng subscription
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SubscriptionActivationService {

    FarmSubscriptionRepository subscriptionRepo;
    SubscriptionPlanRepository planRepo;
    SubscriptionHistoryRepository historyRepo;
    FarmRepository farmRepo;
    UserRepository userRepo;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public FarmSubscriptionEntity activateSubscription(PaymentTransactionEntity payment) {

        SubscriptionPlanEntity newPlan = planRepo.findById(payment.getSubscriptionPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        FarmEntity farm = farmRepo.findById(payment.getFarmId())
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        Optional<FarmSubscriptionEntity> existingOpt =
                subscriptionRepo.findByFarmIdAndIsCurrentTrue(payment.getFarmId());

        Instant now = Instant.now();
        BillingCycle cycle = detectBillingCycle(payment);
        Instant expiresAt = calculateExpiry(now, cycle);

        if (existingOpt.isEmpty()) {
            return createNewSubscription(farm, newPlan, payment, cycle, now, expiresAt);
        }

        FarmSubscriptionEntity current = existingOpt.get();

        if (current.getPlan().getId().equals(newPlan.getId())) {
            return renewSubscription(current, payment, cycle, now);
        }

        return upgradeSubscription(current, farm, newPlan, payment, cycle, now, expiresAt);
    }

    // ─────────────────────────────────────────

    private FarmSubscriptionEntity createNewSubscription(FarmEntity farm,
                                                         SubscriptionPlanEntity plan,
                                                         PaymentTransactionEntity payment,
                                                         BillingCycle cycle,
                                                         Instant now,
                                                         Instant expiresAt) {

        FarmSubscriptionEntity sub = FarmSubscriptionEntity.builder()
                .farm(farm)
                .plan(plan)
                .status(SubscriptionStatus.ACTIVE)
                .billingCycle(cycle)
                .isCurrent(true)
                .startedAt(now)
                .expiresAt(expiresAt)
                .autoRenew(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        subscriptionRepo.save(sub);

        recordHistory(sub, "CREATED", null, plan.getId(), payment.getUserId(), null);

        return sub;
    }

    private FarmSubscriptionEntity renewSubscription(FarmSubscriptionEntity current,
                                                     PaymentTransactionEntity payment,
                                                     BillingCycle cycle,
                                                     Instant now) {

        Instant base = (current.getExpiresAt() != null &&
                current.getExpiresAt().isAfter(now))
                ? current.getExpiresAt()
                : now;

        Instant newExpiry = calculateExpiry(base, cycle);

        current.setExpiresAt(newExpiry);
        current.setStatus(SubscriptionStatus.ACTIVE);
        current.setGraceUntil(null);
        current.setUpdatedAt(now);

        subscriptionRepo.save(current);

        recordHistory(current,
                "RENEWED",
                current.getPlan().getId(),
                current.getPlan().getId(),
                payment.getUserId(),
                null);

        return current;
    }

    private FarmSubscriptionEntity upgradeSubscription(FarmSubscriptionEntity old,
                                                       FarmEntity farm,
                                                       SubscriptionPlanEntity newPlan,
                                                       PaymentTransactionEntity payment,
                                                       BillingCycle cycle,
                                                       Instant now,
                                                       Instant expiresAt) {

        UUID oldPlanId = old.getPlan().getId();

        // disable old
        old.setIsCurrent(false);
        old.setUpdatedAt(now);
        subscriptionRepo.save(old);

        // create new
        FarmSubscriptionEntity newSub = FarmSubscriptionEntity.builder()
                .farm(farm)
                .plan(newPlan)
                .status(SubscriptionStatus.ACTIVE)
                .billingCycle(cycle)
                .isCurrent(true)
                .startedAt(now)
                .expiresAt(expiresAt)
                .autoRenew(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        subscriptionRepo.save(newSub);

        recordHistory(newSub,
                "UPGRADED",
                oldPlanId,
                newPlan.getId(),
                payment.getUserId(),
                null);

        return newSub;
    }

    // ─────────────────────────────────────────

    private void recordHistory(FarmSubscriptionEntity sub,
                               String eventType,
                               UUID fromPlanId,
                               UUID toPlanId,
                               UUID triggeredBy,
                               String notes) {

        FarmSubscriptionEntity farmSubscription = subscriptionRepo.findById(sub.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        SubscriptionPlanEntity fromPlan = planRepo.findById(fromPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        SubscriptionPlanEntity toPlan = planRepo.findById(toPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        UserEntity user = userRepo.findById(triggeredBy)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        SubscriptionHistoryEntity history = SubscriptionHistoryEntity.builder()
                .farm(sub.getFarm())
                .farmSubscription(farmSubscription)
                .eventType(eventType)
                .fromPlan(fromPlan)
                .toPlan(toPlan)
                .triggeredBy(user)
                .notes(notes)
                .build();

        historyRepo.save(history);
    }

    private Instant calculateExpiry(Instant from, BillingCycle cycle) {
        return switch (cycle) {
            case MONTHLY -> from.plusSeconds(30L * 24 * 60 * 60);
            case ANNUAL -> from.plusSeconds(365L * 24 * 60 * 60);
        };
    }

    private BillingCycle detectBillingCycle(PaymentTransactionEntity payment) {
        return BillingCycle.MONTHLY;
    }
}
