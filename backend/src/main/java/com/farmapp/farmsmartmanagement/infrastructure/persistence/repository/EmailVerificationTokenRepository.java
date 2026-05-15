package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationTokenEntity, UUID> {

    Optional<EmailVerificationTokenEntity> findByTokenHash(String tokenHash);

    void deleteByUserId(UUID userId);

    boolean existsByUserIdAndUsedAtIsNull(UUID userId);

    Optional<EmailVerificationTokenEntity> findTopByUserIdOrderByCreatedAtDesc(UUID id);

    @Modifying
    @Query("""
        UPDATE EmailVerificationTokenEntity t
        SET t.revokedAt = :now
        WHERE t.user.id = :userId
          AND t.revokedAt IS NULL
          AND t.usedAt IS NULL
    """)
    void revokeAllByUserId(UUID userId, Instant now);
}
