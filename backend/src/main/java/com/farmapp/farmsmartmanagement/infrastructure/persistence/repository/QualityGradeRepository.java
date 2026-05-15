package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.QualityGradeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QualityGradeRepository extends JpaRepository<QualityGradeEntity, UUID> {
}
