package com.farmapp.farmsmartmanagement.modules.plan.dto.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlotSnapshotResponse {
    UUID plotId;
    Long version;
    String plotName;
}