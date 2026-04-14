package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlotEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlotRepository extends JpaRepository<PlotEntity, UUID> {

    List<PlotEntity> findByFarm_Id(UUID farmId);

    boolean existsByFarmAndName(FarmEntity farm, String name);

    Optional<PlotEntity> findByIdAndFarmId(UUID plotId, UUID farmId);
}
