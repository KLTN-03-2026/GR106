package com.farmapp.farmsmartmanagement.modules.plan.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddPlotToPlanRequest {

    @NotEmpty(message = "Danh sách plot không được rỗng")
    List<UUID> plotIds;
}