package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
        UPDATE RefreshTokenEntity t
        SET t.revokedAt = :now
        WHERE t.tokenHash = :hash
    """)
    void revoke(@Param("hash") String hash,
                @Param("now") Instant now);

    @Modifying
    @Query("""
        UPDATE RefreshTokenEntity t
        SET t.revokedAt = :now
        WHERE t.userId = :userId
    """)
    void revokeAll(@Param("userId") UUID userId,
                   @Param("now") Instant now);
}