package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvitationPreviewResponse {
    String farmName;
    String inviterName;
    String role;
    String email;
    String expiresAt;
}
