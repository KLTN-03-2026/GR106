package com.farmapp.farmsmartmanagement.modules.auth.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.config.app.JwtProperties;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.modules.auth.dto.response.TokenResponse;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.RefreshTokenEntity;
import com.farmapp.farmsmartmanagement.infrastructure.security.JwtProvider;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository repo;
    private final JwtProvider jwtProvider;
    private final PermissionService permissionService;
    private final RlsUtils rlsUtils;
    private final JwtProperties jwtProperties;

    private String hash(String val) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(val.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // CREATE REFRESH TOKEN
    public String create(UserEntity user, String userAgent, String ip) {

        return rlsUtils.runAsAdmin(() -> {
                String raw = UUID.randomUUID().toString();

                // set fields
                var now = Instant.now();

                RefreshTokenEntity entity = new RefreshTokenEntity();
                entity.setUser(user);
                entity.setTokenHash(hash(raw));
                entity.setExpiresAt(now.plusSeconds(jwtProperties.getRefreshExpiration())); // 7 days
                entity.setUserAgent(userAgent);
                entity.setIpAddress(ip);

                repo.save(entity);

                return raw;
            });
    }

    // REFRESH (ROTATION + REUSE DETECT)
    @Transactional
    public TokenResponse refresh(String rawToken, String userAgent, String ipAddress) {
        return rlsUtils.runAsAdmin(()->{
                String hash = hash(rawToken);

                RefreshTokenEntity token = repo.findByTokenHash(hash)
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_REFRESH_TOKEN));

                if (token.getExpiresAt().isBefore(Instant.now())) {
                    throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
                }

                if (token.getRevokedAt() != null) {
                    repo.revokeAll(token.getUser().getId(), Instant.now());
                    throw new AppException(ErrorCode.REFRESH_TOKEN_REUSED);
                }

                repo.revoke(hash, Instant.now());

                // dùng IP/UA mới từ request hiện tại thay vì của token cũ
                String newRefresh = create(token.getUser(), userAgent, ipAddress);

                List<String> systemRoles = permissionService.loadSystemRoles(token.getUser().getId());
                String access = jwtProvider.generateUserToken(token.getUser().getId(), token.getUser().getEmail(), systemRoles);


                return new TokenResponse(access, newRefresh);
            });
    }
}