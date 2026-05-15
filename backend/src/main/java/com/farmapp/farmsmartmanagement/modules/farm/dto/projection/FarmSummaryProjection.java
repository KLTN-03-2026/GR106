package com.farmapp.farmsmartmanagement.modules.farm.dto.projection;

import java.util.UUID;

public interface FarmSummaryProjection {
    UUID getFarmId();
    String getFarmName();
    String getDescription();
    UUID getOwnerId();
    String getOwnerFullName();
    String getOwnerAvatarUrl();
    String getMyRole();
    Boolean getIsOwner();
}