package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmMemberRepository extends JpaRepository<FarmMemberEntity, UUID> {

    List<FarmMemberEntity> findByFarm_Id(UUID farmId);

    List<FarmMemberEntity> findByUser_Id(UUID userId);

    Optional<FarmMemberEntity> findByFarm_IdAndUser_Id(UUID farmId, UUID userId);

    boolean existsByFarm_IdAndUser_Id(UUID farmId, UUID userId);
}