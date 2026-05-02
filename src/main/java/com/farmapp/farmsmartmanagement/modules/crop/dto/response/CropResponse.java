package com.farmapp.farmsmartmanagement.modules.crop.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.CropScope;

import java.util.UUID;

public record CropResponse(
        UUID id,
        String name,
        Long version,
        CropTypeResponse cropType,
        CropScope scope,
        UUID clonedFromId,
        String imageUrl,
        String description
) {
}
