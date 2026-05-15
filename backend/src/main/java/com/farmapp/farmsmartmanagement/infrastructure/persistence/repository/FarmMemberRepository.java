package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmMemberEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmMemberRepository extends JpaRepository<FarmMemberEntity, UUID> {

    @Query("SELECT fm FROM FarmMemberEntity fm " +
            "JOIN FETCH fm.user " +
            "JOIN FETCH fm.farmRole " +
            "WHERE fm.farm.id = :farmId")
    List<FarmMemberEntity> findAllByFarm_Id(@Param("farmId") UUID farmId);

    List<FarmMemberEntity> findByUser_Id(UUID userId);

    @EntityGraph(attributePaths = {"user"})
    Optional<FarmMemberEntity> findByFarm_IdAndUser_Id(UUID farmId, UUID userId);

    boolean existsByFarm_IdAndUser_Id(UUID farmId, UUID userId);

    @Query("""
    SELECT COUNT(fm) FROM FarmMemberEntity fm
    WHERE fm.farm.id = :farmId
      AND fm.isActive = true
    """)
    long countActiveByFarmId(@Param("farmId") UUID farmId);

    boolean existsByFarm_IdAndUser_IdAndIsActiveTrue(UUID farmId, UUID userId);
}