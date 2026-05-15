package com.farmapp.farmsmartmanagement.modules.user.service;


import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmMapper;
import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import com.farmapp.farmsmartmanagement.modules.user.mapper.UserMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    RlsUtils rlsUtils;

    EmailVerificationTokenRepository emailVerificationTokenRepository;
    UserRoleRepository userRoleRepository;
    RefreshTokenRepository refreshTokenRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
            return rlsUtils.runAsAdmin(()->{
                return userMapper.toUserResponses(userRepository.findAll());
            });
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> findUsersNeedingNewVerificationToken() {
        return rlsUtils.runAsAdmin(()->{
            log.info("ds{}", userRepository.findUsersNeedingNewVerificationToken());
            return userMapper.toUserResponses(userRepository.findUsersNeedingNewVerificationToken());
        });
    }


    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUserNotYetVerify(UUID userId) {
        rlsUtils.runAsAdmin(()->{
            if (emailVerificationTokenRepository.existsByUserIdAndUsedAtIsNull(userId)){
                emailVerificationTokenRepository.deleteByUserId(userId);
                refreshTokenRepository.deleteByUserId(userId);
                userRoleRepository.deleteByUserId(userId);
                userRepository.deleteById(userId);
            }
            else throw new AppException(ErrorCode.USER_NOT_EXISTED);
        });
    }





}
