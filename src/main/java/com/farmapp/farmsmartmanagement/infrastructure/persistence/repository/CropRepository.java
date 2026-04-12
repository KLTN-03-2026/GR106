package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CropRepository extends JpaRepository<CropEntity, UUID> {
    boolean existsByNameAndScopeAndDeletedAtIsNull(String name, CropScope cropScope);

    Optional<CropEntity> findByIdAndScope(UUID id, CropScope cropScope);

    boolean existsByCropType(CropTypeEntity cropType);
}
