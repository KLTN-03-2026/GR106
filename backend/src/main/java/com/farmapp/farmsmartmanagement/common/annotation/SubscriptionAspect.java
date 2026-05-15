package com.farmapp.farmsmartmanagement.common.annotation;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.LimitType;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionFeature;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmMemberRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmSubscriptionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionAspect {

    @Autowired
    private FarmSubscriptionRepository farmSubscriptionRepository;

    @Autowired
    private PlotRepository plotRepository;

    @Autowired
    private FarmMemberRepository farmMemberRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Before("@annotation(requiresSubscription)")
    public void checkSubscription(JoinPoint joinPoint,
                                  RequiresSubscription requiresSubscription) {
        UUID farmId = securityUtils.getCurrentFarmId();
        if (farmId == null) return; // không có farm context → bỏ qua

        FarmSubscriptionEntity sub = farmSubscriptionRepository
                .findCurrentByFarmId(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        // 1. Kiểm tra subscription còn hiệu lực
        checkSubscriptionActive(sub);

        // 2. Kiểm tra feature
        if (requiresSubscription.features().length > 0) {
            checkFeatures(sub.getSubscriptionPlan(), requiresSubscription.features());
        }

        // 3. Kiểm tra giới hạn
        if (requiresSubscription.checkLimits()) {
            checkLimits(farmId, sub.getSubscriptionPlan(), requiresSubscription.limitType());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void checkSubscriptionActive(FarmSubscriptionEntity sub) {
        Instant now = Instant.now();

        switch (sub.getStatus()) {
            case ACTIVE, TRIAL -> {
                // Kiểm tra hết hạn
                if (sub.getExpiresAt() != null && now.isAfter(sub.getExpiresAt())) {
                    // Còn trong grace period không?
                    if (sub.getGraceUntil() != null && now.isBefore(sub.getGraceUntil())) {
                        log.warn("[Subscription] Farm {} đang trong grace period", sub.getFarm().getId());
                        // Grace period → cho phép xem, không cho tạo mới
                        // AOP không block ở đây, service layer sẽ handle
                    } else {
                        throw new AppException(ErrorCode.SUBSCRIPTION_EXPIRED);
                    }
                }
            }
            case GRACE_PERIOD -> {
                // Chỉ cho phép đọc, không cho tạo mới
                // Xử lý ở checkLimits
                log.warn("[Subscription] Farm {} đang trong grace period", sub.getFarm().getId());
            }
            case EXPIRED, CANCELLED ->
                    throw new AppException(ErrorCode.SUBSCRIPTION_EXPIRED);
            case PENDING ->
                    throw new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE);
        }
    }

    private void checkFeatures(SubscriptionPlanEntity plan,
                               SubscriptionFeature[] features) {
        for (SubscriptionFeature feature : features) {
            switch (feature) {
                case AI_DIAGNOSIS -> {
                    if (!plan.getHasAiDiagnosis())
                        throw new AppException(ErrorCode.FEATURE_NOT_AVAILABLE);
                }
                case PDF_EXPORT -> {
                    if (!plan.getHasPdfExport())
                        throw new AppException(ErrorCode.FEATURE_NOT_AVAILABLE);
                }
                case MAP -> {
                    if (!plan.getHasMap())
                        throw new AppException(ErrorCode.FEATURE_NOT_AVAILABLE);
                }
            }
        }
    }

    private void checkLimits(UUID farmId, SubscriptionPlanEntity plan, LimitType limitType) {
        switch (limitType) {
            case PLOT -> {
                long currentPlots = plotRepository.countActivePlotsByFarmId(farmId);
                if (currentPlots >= plan.getMaxPlots()) {
                    throw new AppException(ErrorCode.PLOT_LIMIT_EXCEEDED,
                            "Gói hiện tại cho phép tối đa " + plan.getMaxPlots() + " lô đất");
                }
            }
            case MEMBER -> {
                long currentMembers = farmMemberRepository.countActiveByFarmId(farmId);
                if (currentMembers >= plan.getMaxMembers()) {
                    throw new AppException(ErrorCode.MEMBER_LIMIT_EXCEEDED,
                            "Gói hiện tại cho phép tối đa " + plan.getMaxMembers() + " thành viên");
                }
            }
            default -> { /* không check */ }
        }
    }
}