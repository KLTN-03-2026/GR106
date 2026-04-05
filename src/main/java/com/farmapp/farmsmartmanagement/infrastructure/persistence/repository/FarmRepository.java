package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.modules.farm.dto.projection.FarmSummaryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FarmRepository extends JpaRepository<FarmEntity, UUID> {

    List<FarmEntity> findByOwner_Id(UUID ownerId);

    boolean existsByOwner_IdAndName(UUID ownerId, String name);

    List<FarmEntity> findAllByOwnerId(UUID userId);

    // FarmRepository.java — dùng projection thay Object[]
    @Query(value = """
    SELECT
        f.id            AS farmId,
        f.name          AS farmName,
        f.description   AS description,
        u.id            AS ownerId,
        u.full_name     AS ownerFullName,
        u.avatar_url    AS ownerAvatarUrl,
        COALESCE(fr.name, 'OWNER') AS myRole,
        (f.owner_id = :userId)     AS isOwner
    FROM farms f
    JOIN users u ON u.id = f.owner_id
    LEFT JOIN farm_members fm ON fm.farm_id = f.id
        AND fm.user_id = :userId
        AND fm.is_active = TRUE
    LEFT JOIN farm_roles fr ON fr.id = fm.farm_role_id
    WHERE f.deleted_at IS NULL
    AND (
        f.owner_id = :userId
        OR fm.id IS NOT NULL
    )
    ORDER BY f.created_at DESC
    """, nativeQuery = true)
    List<FarmSummaryProjection> findFarmSummariesByUserId(@Param("userId") UUID userId);
}