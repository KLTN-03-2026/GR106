package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    // Cách 3: nếu muốn biết token còn hạn hay không (để resend email)
    @Query("""
    SELECT u FROM UserEntity u
    WHERE u.status = 'PENDING'
      AND u.deletedAt IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM EmailVerificationTokenEntity e
          WHERE e.user.id = u.id
            AND e.usedAt IS NULL
            AND e.revokedAt IS NULL
            AND e.expiresAt > CURRENT_TIMESTAMP
      )
""")
    List<UserEntity> findUsersNeedingNewVerificationToken();

    @Query("""
        SELECT (COUNT(u) > 0)
        FROM UserEntity u
        WHERE u.email = :email
          AND EXISTS (
              SELECT 1
              FROM UserRoleEntity ur
              JOIN ur.role r
              WHERE ur.user = u
                AND r.name = 'ROLE_ADMIN'
          )
    """)
    boolean existsByEmailAndRoleIsAdmin(@Param("email") String email);


}