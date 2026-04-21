package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    @Query(value = """
        SELECT u FROM UserEntity u
        JOIN EmailVerificationTokenEntity e ON e.user.id = u.id
        WHERE e.usedAt IS NULL
    """)
    List<UserEntity> findAllNotYetVerified();
}