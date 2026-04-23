package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SupplierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface SupplierRepository extends JpaRepository<SupplierEntity, String> {

    @Query("""
        SELECT COUNT(s) > 0
        FROM SupplierEntity s
        WHERE s.supplierCode = :supplierCode
          AND s.farm.id = :farmId
    """)
    boolean existsBySupplierCodeAndFarm_Id(String supplierCode, UUID farmId);

    @Modifying
    @Query("""
        DELETE FROM SupplierEntity s
        WHERE s.supplierCode = :supplierCode
    """)
    void deleteBySupplierCode(String supplierCode);
}
