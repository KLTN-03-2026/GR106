package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FarmMemberResponse {
    UUID userId;
    String fullName;
    String email;
    String avatarUrl;
    FarmRoleResponse role;
    Boolean isActive;
    Instant joinedAt;
}
