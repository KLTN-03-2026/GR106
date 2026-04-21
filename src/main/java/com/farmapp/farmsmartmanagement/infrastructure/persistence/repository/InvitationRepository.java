package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.domain.enums.InvitationStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.InvitationEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<InvitationEntity, UUID> {
    @EntityGraph(attributePaths = {"invitedBy","farm"})
    List<InvitationEntity> findAllByUser_Id(UUID userId);

    List<InvitationEntity> findAllByEmailAndStatus(String email, InvitationStatus invitationStatus);
}
