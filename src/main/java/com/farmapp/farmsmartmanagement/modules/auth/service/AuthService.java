package com.farmapp.farmsmartmanagement.modules.auth.service;

import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.config.app.JwtProperties;
import com.farmapp.farmsmartmanagement.domain.enums.UserStatus;
import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.HashUtils;
import com.farmapp.farmsmartmanagement.config.app.AppProperties;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.LoginRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RegisterRequest;
import com.farmapp.farmsmartmanagement.modules.auth.dto.response.TokenResponse;
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

import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
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
    JwtProperties jwtProperties;


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


            String rawToken = createAndSaveVerificationToken(user);

            // KHÔNG gọi email ở đây nữa
            // Dùng event — gửi sau khi transaction commit xong
            String link = appProperties.getFrontendUrl() + "/verify-email?token=" + rawToken;
            eventPublisher.publishEvent(
                    new SendVerifyEmailEvent(this, user.getFullName(), user.getEmail(), link)
            );
        });

    }

    @Transactional
    public void resendMailRegister(LoginRequest req) {
        rlsUtils.runAsAdmin(()->{
            UserEntity user = userRepository
                .findByEmail(req.email())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            if(user.getStatus().equals(UserStatus.ACTIVE)) {
                throw new AppException(ErrorCode.USER_HAS_BEEN_ACTIVE);
            }

            if(user.getStatus().equals(UserStatus.SUSPENDED) || Boolean.TRUE.equals(user.getIsLocked())) {
                throw new AppException(ErrorCode.USER_SUSPENDED);
            }

            if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                throw new AppException(ErrorCode.WRONG_PASSWORD);
            }

            Optional<EmailVerificationTokenEntity> latest =
                    emailVerificationTokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());

            if (latest.isPresent() && latest.get().getCreatedAt().isAfter(Instant.now().minusSeconds(60))) {
                throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
            }

            emailVerificationTokenRepository.revokeAllByUserId(user.getId(), Instant.now());


            String rawToken = createAndSaveVerificationToken(user);

            // Dùng event — gửi sau khi transaction commit xong
            String link = appProperties.getFrontendUrl() + "/verify-email?token=" + rawToken;
            eventPublisher.publishEvent(
                    new SendVerifyEmailEvent(this, user.getFullName(), user.getEmail(), link)
            );
            log.info("Resend verify email for userId={}", user.getId());
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

                if(user.getStatus().equals(UserStatus.SUSPENDED) || user.getIsLocked()) {
                    throw new AppException(ErrorCode.USER_SUSPENDED);
                }

                if (!passwordEncoder.matches(req.password(), user.getPassword())) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }

                refreshTokenRepository.revokeAll(user.getId(), Instant.now());
                // Load system roles → đưa vào token
                List<String> systemRoles = permissionRepository.findSystemRoles(user.getId());
                String access = jwtProvider.generateUserToken(user.getId(), user.getEmail(), systemRoles);

                String raw = UUID.randomUUID().toString();

                // set fields
                var now = Instant.now();

                RefreshTokenEntity entity = new RefreshTokenEntity();
                entity.setUser(user);
                entity.setTokenHash(hash(raw));
                entity.setExpiresAt(now.plusSeconds(jwtProperties.getRefreshExpiration())); // 7 days
                entity.setUserAgent(userAgent);
                entity.setIpAddress(ip);

                refreshTokenRepository.save(entity);
                return new TokenResponse(access, raw);
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

    private String hash(String val) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(val.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String createAndSaveVerificationToken(UserEntity user){
        String rawToken = UUID.randomUUID().toString();
        String hash = HashUtils.sha256(rawToken);

        EmailVerificationTokenEntity token = new EmailVerificationTokenEntity();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setExpiresAt(Instant.now().plusSeconds(15 * 60));
        token.setUsedAt(null);
        token.setRevokedAt(null);
        token.setCreatedAt(Instant.now());
        emailVerificationTokenRepository.save(token);
        return rawToken;
    }
}
