package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlotRepository extends JpaRepository<PlotEntity, UUID> {

    List<PlotEntity> findByFarm_Id(UUID farmId);

    boolean existsByFarmAndName(FarmEntity farm, String name);

    Optional<PlotEntity> findByIdAndFarmId(UUID plotId, UUID farmId);

    @Query("SELECT p FROM PlotEntity p WHERE p.id IN :ids AND p.farm.id = :farmId")
    List<PlotEntity> findAllByIdInAndFarmId(
            @Param("ids") List<UUID> ids,
            @Param("farmId") UUID farmId
    );
}
