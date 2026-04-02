package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {

    @Query(value = """
        SELECT p.name
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = :userId

        UNION

        SELECT p.name
        FROM farm_members fm
        JOIN farm_role_permissions frp ON fm.farm_role_id = frp.farm_role_id
        JOIN permissions p ON frp.permission_id = p.id
        WHERE fm.user_id = :userId
          AND (:farmId IS NOT NULL AND fm.farm_id = :farmId)
          AND fm.is_active = true
    """, nativeQuery = true)
    List<String> findPermissions(UUID userId, UUID farmId);
}