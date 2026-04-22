package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.InvitationStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvitationEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by",nullable = false)
    UserEntity invitedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_role_id",  nullable = false)
    FarmRoleEntity farmRole;

    @Column(name = "email", nullable = false)
    String email;


    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "status",nullable = false)
    InvitationStatus status;

    @Column(name = "expires_at", nullable = false)
    Instant expiresAt;

    @Column(name = "accepted_at")
    Instant acceptedAt;

    @Column(name = "created_at")
    Instant createdAt;


}
