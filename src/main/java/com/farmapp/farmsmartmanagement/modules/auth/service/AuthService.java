package com.farmapp.farmsmartmanagement.modules.auth.service;

import com.farmapp.farmsmartmanagement.common.constant.UserStatus;
import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.HashUtils;
import com.farmapp.farmsmartmanagement.config.app.AppProperties;
import com.farmapp.farmsmartmanagement.dto.request.auth.LoginRequest;
import com.farmapp.farmsmartmanagement.dto.request.auth.RegisterRequest;
import com.farmapp.farmsmartmanagement.dto.response.auth.TokenResponse;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.RoleEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserRoleEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.infrastructure.security.JwtProvider;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailService;
import com.farmapp.farmsmartmanagement.infrastructure.service.EmailTemplateService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

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
    PasswordEncoder passwordEncoder;
    EmailVerificationTokenRepository emailVerificationTokenRepository;
    EmailService emailService;
    EmailTemplateService emailTemplateService;
    AppProperties appProperties; // thêm config frontend url

    @Transactional
    public void register(RegisterRequest req) {

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

        // Gán ROLE_USER mặc định
        RoleEntity userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        userRoleRepository.save(new UserRoleEntity(user, userRole));

        // Tạo email verification token
        String rawToken = UUID.randomUUID().toString();
        String hash = HashUtils.sha256(rawToken);

        EmailVerificationTokenEntity token = new EmailVerificationTokenEntity();
        token.setUserId(user.getId());
        token.setTokenHash(hash);
        token.setExpiresAt(Instant.now().plusSeconds(15 * 60));
        emailVerificationTokenRepository.save(token);

        // Link đúng — đọc từ config
        String link = appProperties.getFrontendUrl() + "/verify-email?token=" + rawToken;

        String html = emailTemplateService.buildVerifyEmail(user.getFullName(), link);
        emailService.sendHtml(user.getEmail(), "Xác thực tài khoản", html);
    }

    public TokenResponse login(LoginRequest req, String userAgent, String ip) {

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

        // Load system roles → đưa vào token
        List<String> systemRoles = permissionRepository.findSystemRoles(user.getId());
        String access = jwtProvider.generateUserToken(user.getId(), systemRoles);

        String refresh = refreshTokenService.create(user.getId(), userAgent, ip);

        return new TokenResponse(access, refresh);
    }

    @Transactional
    public void verify(String rawToken) {

        String hash = HashUtils.sha256(rawToken);

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

        UserEntity user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        user.setStatus(UserStatus.ACTIVE);
        token.setUsedAt(Instant.now());

        userRepository.save(user);
        emailVerificationTokenRepository.save(token);
    }
}
