package com.farmapp.farmsmartmanagement.modules.user.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    RlsUtils rlsUtils;

    FarmRoleRepository farmRoleRepository;
    FarmRepository farmRepository;
    EmailVerificationTokenRepository emailVerificationTokenRepository;
    UserRoleRepository userRoleRepository;
    PlanRepository planRepository;
    TaskRepository taskRepository;
    PaymentTransactionRepository paymentTransactionRepository;
    SubscriptionHistoryRepository subscriptionHistoryRepository;
    FarmSubscriptionRepository farmSubscriptionRepository;
    RefreshTokenRepository refreshTokenRepository;
    CropRepository cropRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
            return rlsUtils.runAsAdmin(()->{
                return userMapper.toUserResponses(userRepository.findAll());
            });
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsersNotYetVerified() {
        return rlsUtils.runAsAdmin(()->{
            return userMapper.toUserResponses(userRepository.findAllNotYetVerified());
        });
    }


    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUserNotYetVerify(UUID userId) {
        rlsUtils.runAsAdmin(()->{
            if (emailVerificationTokenRepository.existsByUserIdAndUsedAtNull(userId)){
                emailVerificationTokenRepository.deleteByUserId(userId);
                refreshTokenRepository.deleteByUserId(userId);
                userRoleRepository.deleteByUserId(userId);
                userRepository.deleteById(userId);
            }
            else throw new AppException(ErrorCode.USER_NOT_EXISTED);
        });
    }





}
