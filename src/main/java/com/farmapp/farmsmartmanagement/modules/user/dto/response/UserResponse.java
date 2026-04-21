package com.farmapp.farmsmartmanagement.modules.user.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.UserStatus;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    UUID id;
    String fullName;
    String email;
    String phone;
    UserStatus status;
    Boolean isLocked;
    Instant createdAt;
}
