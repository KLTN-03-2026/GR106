package com.farmapp.farmsmartmanagement.modules.farm.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class FarmResponse {

    UUID id;

    UUID ownerId;

    String name;

    String description;

    Instant createdAt;

    Instant updatedAt;
}