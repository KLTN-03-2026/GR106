package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.CreateFarmRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.UpdateFarmRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSummaryResponse;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class FarmService {

    FarmRepository farmRepository;
    FarmMemberRepository farmMemberRepository;
    FarmRoleRepository farmRoleRepository;
    FarmConfigRepository farmConfigRepository;
    SubscriptionPlanRepository planRepository;
    FarmSubscriptionRepository subscriptionRepository;
    SubscriptionHistoryRepository historyRepository;
    UserRepository userRepository;
    FarmMapper farmMapper;
    SecurityUtils securityUtils;

    @PersistenceContext
    EntityManager em;

    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request) {

        UUID userId = securityUtils.getCurrentUserId();
        em.createNativeQuery("SET LOCAL app.current_user_id = '" + userId + "'").executeUpdate();
        em.createNativeQuery("SET LOCAL app.bypass_rls = 'true'").executeUpdate(); // hoặc dùng RlsUtils

        UserEntity owner = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(farmRepository.existsByOwner_IdAndName(userId, request.getFarmName()))
            throw new AppException(ErrorCode.FARM_ALREADY_EXISTS);

        Instant now = Instant.now();

        // 1. Tạo farm
        FarmEntity farm = new FarmEntity();
        farm.setName(request.getFarmName());
        farm.setDescription(request.getDescription());
        farm.setOwner(owner);
        farm.setCreatedBy(owner);
        farm.setCreatedAt(now);
        // Set RLS cho farm vừa tạo — vì RlsContext chưa có farmId tại thời điểm này


        farmRepository.save(farm);



        // 2. Tạo farm_configs
        FarmConfigEntity config = new FarmConfigEntity();
        config.setFarm(farm);
        config.setTimezone("Asia/Ho_Chi_Minh");
        config.setLocale("vi");
        config.setCurrency("VND");
        config.setAllowCropClone(true);
        config.setTaskOverdueNotifyDays((short) 1);
        config.setCreatedAt(now);
        farmConfigRepository.save(config);

        // 3. Lấy plan FREE
        SubscriptionPlanEntity plan = planRepository
                .findByName("FREE")
                .orElseThrow(() -> new AppException(ErrorCode.DEFAULT_SUBSCRIPTION_PLAN_NOT_FOUND));

        // 4. Tạo subscription TRIAL 14 ngày
        Instant expiresAt = now.plus(14, ChronoUnit.DAYS);
        FarmSubscriptionEntity sub = new FarmSubscriptionEntity();
            sub.setFarm(farm);
            sub.setSubscriptionPlan(plan);
            sub.setNextPlan(plan);
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setBillingCycle(BillingCycle.MONTHLY);
            sub.setIsCurrent(true);
            sub.setStartedAt(now);
            sub.setExpiresAt(expiresAt);
            sub.setGraceUntil(expiresAt.plus(3, ChronoUnit.DAYS)); // hết hạn 3 ngày
            sub.setAutoRenew(false);
            sub.setCreatedAt(now);
        subscriptionRepository.save(sub);

        // 5. Tạo subscription history
        SubscriptionHistoryEntity history = new SubscriptionHistoryEntity();
        history.setFarm(farm);
        history.setFarmSubscription(sub);
        history.setEventType("CREATED");
        history.setToPlan(plan);
        history.setTriggeredBy(owner);
        history.setCreatedAt(now);
        historyRepository.save(history);

        // 6. Gán OWNER role cho user
        FarmRoleEntity ownerRole = farmRoleRepository.findByName("OWNER")
                .orElseThrow(() -> new AppException(ErrorCode.FARM_ROLE_NOT_FOUND));

        FarmMemberEntity member = new FarmMemberEntity();
        member.setFarm(farm);
        member.setUser(owner);
        member.setFarmRole(ownerRole);
        member.setIsActive(true);
        member.setJoinedAt(now);

        farmMemberRepository.save(member);

        return farmMapper.toResponse(farm);
    }

    @Transactional
    @PreAuthorize("hasAuthority('farm:update')")
    public FarmResponse updateFarm(UUID farmId, UpdateFarmRequest request) {

        UUID userId = securityUtils.getCurrentUserId();

        FarmEntity farm = farmRepository.findByIdAndOwner_Id(farmId, userId)
                        .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
        farmMapper.updateEntityFromRequest(request, farm);

        return farmMapper.toResponse(farm);
    }

    @Transactional
    public List<FarmResponse> getFarms() {
        UUID userId = securityUtils.getCurrentUserId();
        return farmRepository.findAllByOwnerId(userId)
                .stream()
                .map(farmMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<FarmSummaryResponse> getFarmsSummary() {
        UUID userId = securityUtils.getCurrentUserId();
        return farmRepository.findFarmSummariesByUserId(userId)
                .stream()
                .map(p -> FarmSummaryResponse.builder()
                        .farmId(p.getFarmId())
                        .farmName(p.getFarmName())
                        .description(p.getDescription())
                        .ownerId(p.getOwnerId())
                        .ownerFullName(p.getOwnerFullName())
                        .ownerAvatarUrl(p.getOwnerAvatarUrl())
                        .myRole(p.getMyRole())
                        .isOwner(p.getIsOwner())
                        .build()
                )
                .toList();
    }
}