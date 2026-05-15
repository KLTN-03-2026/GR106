package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.CropTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CropRepository extends JpaRepository<CropEntity, UUID> {
    boolean existsByNameAndScopeAndDeletedAtIsNull(String name, CropScope cropScope);
    boolean existsByCropType(CropTypeEntity cropType);


    List<CropEntity> findAllByScope(CropScope cropScope);

    CropEntity findByIdAndScope(UUID cropId, CropScope cropScope);

    Optional<CropEntity> findByIdAndScopeAndFarm_Id(UUID cropId, CropScope cropScope, UUID farmId);

    List<CropEntity> findAllByScopeAndFarm_Id(CropScope cropScope, UUID farmId);
}
