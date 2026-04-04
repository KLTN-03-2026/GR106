package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.CreateFarmRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmResponse;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class FarmService {

    FarmRepository farmRepository;
    SubscriptionPlanRepository planRepository;
    FarmSubscriptionRepository subscriptionRepository;
    SubscriptionHistoryRepository historyRepository;

    FarmMapper farmMapper;

    UserRepository userRepository;

    SecurityUtils securityUtils;


    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request) {

        UserEntity owner = userRepository.findById(securityUtils.getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Instant now = Instant.now();

        // 1. tạo farm
        FarmEntity farm = new FarmEntity();
        farm.setName(request.getFarmName());
        farm.setDescription(request.getDescription());
        farm.setOwner(owner);
        farm.setName(request.getFarmName());
        farm.setCreatedBy(owner);
        farm.setCreatedAt(now);

        farmRepository.save(farm);

        // 2. lấy plan mặc định (TRIAL hoặc BASIC)
        SubscriptionPlanEntity plan = planRepository
                .findByName("FREE")
                .orElseThrow(() -> new AppException(ErrorCode.DEFAULT_SUBSCRIPTION_PLAN_NOT_FOUND));

        // 3. tạo subscription
        FarmSubscriptionEntity sub = new FarmSubscriptionEntity();
        sub.setFarm(farm);
        sub.setPlan(plan);
        sub.setStatus(SubscriptionStatus.TRIAL);
        sub.setBillingCycle(BillingCycle.MONTHLY);
        sub.setIsCurrent(true);
        sub.setStartedAt(now);
        sub.setExpiresAt(now.plus(14, ChronoUnit.DAYS));
        sub.setAutoRenew(false);
        sub.setCreatedAt(now);

        subscriptionRepository.save(sub);

        // 4. history
        SubscriptionHistoryEntity history = new SubscriptionHistoryEntity();
        history.setId(UUID.randomUUID());
        history.setFarm(farm);
        history.setFarmSubscription(sub);
        history.setEventType("CREATED");
        history.setToPlan(plan);
        history.setTriggeredBy(null); // system
        history.setCreatedAt(now);

        historyRepository.save(history);

        return farmMapper.toResponse(farm);
    }
}