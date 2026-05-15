package com.farmapp.farmsmartmanagement.modules.crop.dto.response;

import java.util.UUID;

public record CropTypeResponse (
        UUID id,

        String name,

        String description
)
{}
