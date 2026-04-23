package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SkuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SkuRepository extends JpaRepository<SkuEntity, String> {


    @Query("""
        SELECT COUNT(s) > 0
        FROM SkuEntity s
        WHERE s.sku = :sku
        AND s.farm.id = :farmId
    """)
    boolean existsBySkuAndFarmId(@Param("sku") String sku,
                                 @Param("farmId") UUID farmId);

    @Modifying
    @Query("""
        DELETE FROM SkuEntity s
        WHERE s.sku = :sku
    """)
    void deleteBySku(@Param("sku") String sku);
}
