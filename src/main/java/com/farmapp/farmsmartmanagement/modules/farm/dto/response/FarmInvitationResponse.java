package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class FarmInvitationResponse {
    UUID id;
    UUID farmId;
    UUID memberId;
    FarmRoleResponse role;
}
