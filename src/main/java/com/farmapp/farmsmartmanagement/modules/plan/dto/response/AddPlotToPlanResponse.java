package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddPlotToPlanResponse {
    UUID planId;
    List<PlotSnapshotResponse> addedPlots;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlotSnapshotResponse {
        UUID plotId;
        String plotName;
    }
}