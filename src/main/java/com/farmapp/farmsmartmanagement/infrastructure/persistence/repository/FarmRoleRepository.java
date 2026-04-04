package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FarmRoleRepository extends JpaRepository<FarmRoleEntity, UUID> {

    Optional<FarmRoleEntity> findByName(String name);
}