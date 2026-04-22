package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.InvitationStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class FarmInvitationResponse {
    UUID id;
    String email;
    FarmSupperSummaryResponse farm;
    FarmRoleResponse role;
    InvitationStatus status;
    InviterResponse inviter;
    Instant createdAt;
    Instant expiresAt;
}
