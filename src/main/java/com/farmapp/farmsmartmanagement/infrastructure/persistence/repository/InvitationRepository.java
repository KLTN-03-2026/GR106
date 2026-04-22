package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.domain.enums.InvitationStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.InvitationEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<InvitationEntity, UUID> {
    @EntityGraph(attributePaths = {"invitedBy","farm"})
    List<InvitationEntity> findAllByInvitedBy_Id(UUID userId);

    boolean existsByEmailAndFarm_IdAndStatus(String email, UUID farmId, InvitationStatus invitationStatus);

    @EntityGraph(attributePaths = {"invitedBy","farm","farmRole"})
    List<InvitationEntity> findAllByEmail(String email);

    @EntityGraph(attributePaths = {"invitedBy","farm","farmRole"})
    List<InvitationEntity> findAllByEmailAndStatus(String email, InvitationStatus status);

    @EntityGraph(attributePaths = {"invitedBy","farm","farmRole"})
    List<InvitationEntity> findAllByFarm_Id(UUID farmId);

    @EntityGraph(attributePaths = {"invitedBy","farm","farmRole"})
    List<InvitationEntity> findAllByFarm_IdAndStatus(UUID farmId, InvitationStatus status);
}
