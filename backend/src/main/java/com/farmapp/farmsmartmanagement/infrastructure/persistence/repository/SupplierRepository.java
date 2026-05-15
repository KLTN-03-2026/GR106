package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SupplierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// SupplierRepository.java
public interface SupplierRepository extends JpaRepository<SupplierEntity, UUID> {

    boolean existsBySupplierCodeAndFarm_Id(String supplierCode, UUID farmId);

    Optional<SupplierEntity> findBySupplierCodeAndFarm_Id(String supplierCode, UUID farmId);

    void deleteBySupplierCodeAndFarm_Id(String supplierCode, UUID farmId);

    List<SupplierEntity> findAllByFarm_Id(UUID farmId);
}
