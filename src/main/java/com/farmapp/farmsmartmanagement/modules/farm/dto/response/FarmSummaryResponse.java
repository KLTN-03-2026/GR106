package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class FarmSummaryResponse {

    UUID farmId;
    String farmName;
    String description;

    // Chủ farm
    UUID ownerId;
    String ownerFullName;
    String ownerAvatarUrl;

    // Vai trò của user hiện tại trong farm
    String myRole;        // "OWNER" | "MANAGER" | "AGRONOMIST" | "WORKER"
    boolean isOwner;      // true nếu mình là chủ farm
}