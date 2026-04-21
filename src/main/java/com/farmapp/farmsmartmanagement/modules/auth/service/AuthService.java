package com.farmapp.farmsmartmanagement.modules.auth.service;

import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.domain.enums.UserStatus;
import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.HashUtils;
import com.farmapp.farmsmartmanagement.config.app.AppProperties;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.LoginRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RegisterRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.response.TokenResponse;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.RoleEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserRoleEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.infrastructure.security.JwtProvider;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailService;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailTemplateService;
import com.farmapp.farmsmartmanagement.modules.auth.event.SendVerifyEmailEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    PermissionRepository permissionRepository;
    JwtProvider jwtProvider;
    RefreshTokenService refreshTokenService;
    RefreshTokenRepository refreshTokenRepository;
    PasswordEncoder passwordEncoder;
    EmailVerificationTokenRepository emailVerificationTokenRepository;
    EmailService emailService;
    EmailTemplateService emailTemplateService;
    AppProperties appProperties; // thêm config frontend url

    ApplicationEventPublisher eventPublisher;
    RlsUtils rlsUtils;

    // AuthService.java — register
    @Transactional
    public void register(RegisterRequest req) {

        rlsUtils.runAsAdmin(() ->{
            if (userRepository.findByEmail(req.email()).isPresent()) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }

            UserEntity user = new UserEntity();
            user.setEmail(req.email());
            user.setPassword(passwordEncoder.encode(req.password()));
            user.setFullName(req.fullName());
            user.setStatus(UserStatus.PENDING);
            user.setIsLocked(false);
            userRepository.save(user);

            RoleEntity userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            userRoleRepository.save(new UserRoleEntity(user, userRole));

            String rawToken = UUID.randomUUID().toString();
            String hash = HashUtils.sha256(rawToken);

            EmailVerificationTokenEntity token = new EmailVerificationTokenEntity();
            token.setUser(user);
            token.setTokenHash(hash);
            token.setExpiresAt(Instant.now().plusSeconds(15 * 60));
            emailVerificationTokenRepository.save(token);

            // KHÔNG gọi email ở đây nữa
            // Dùng event — gửi sau khi transaction commit xong
            String link = appProperties.getFrontendUrl() + "/verify-email?token=" + rawToken;
            eventPublisher.publishEvent(
                    new SendVerifyEmailEvent(this, user.getFullName(), user.getEmail(), link)
            );
        });

    }

    @Transactional
    public TokenResponse login(LoginRequest req, String userAgent, String ip) {
        return rlsUtils.runAsAdmin(()->{
                UserEntity user = userRepository.findByEmail(req.email())
                        .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

                if (Boolean.TRUE.equals(user.getIsLocked())) {
                    throw new AppException(ErrorCode.ACCOUNT_HAS_BEEN_BLOCKED);
                }

                // Check chưa verify email
                if (user.getStatus() == UserStatus.PENDING) {
                    throw new AppException(ErrorCode.ACCOUNT_NOT_VERIFIED);
                }

                if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }

                refreshTokenRepository.revokeAll(user.getId(), Instant.now());
                // Load system roles → đưa vào token
                List<String> systemRoles = permissionRepository.findSystemRoles(user.getId());
                String access = jwtProvider.generateUserToken(user.getId(), systemRoles);


                String refresh = refreshTokenService.create(user.getId(), userAgent, ip);

                return new TokenResponse(access, refresh);
            });
    }

    @Transactional
    public void verify(String rawToken) {
        rlsUtils.runAsAdmin(() -> {
            String hash = HashUtils.sha256(rawToken);
            log.info("RAW TOKEN: [{}]", rawToken);
            log.info("HASH: [{}]", hash);

            EmailVerificationTokenEntity token = emailVerificationTokenRepository
                    .findByTokenHash(hash)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Token không hợp lệ"));

            // Thứ tự: expired → revoked → used
            if (token.getExpiresAt().isBefore(Instant.now())) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Token đã hết hạn");
            }
            if (token.getRevokedAt() != null) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Token đã bị thu hồi");
            }
            if (token.getUsedAt() != null) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Token đã được sử dụng");
            }

            UserEntity user = userRepository.findById(token.getUser().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            user.setStatus(UserStatus.ACTIVE);
            token.setUsedAt(Instant.now());

            userRepository.save(user);
            emailVerificationTokenRepository.save(token);
        });
    }
}
