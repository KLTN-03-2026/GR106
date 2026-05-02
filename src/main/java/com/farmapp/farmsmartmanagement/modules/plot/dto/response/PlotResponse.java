package com.farmapp.farmsmartmanagement.modules.plot.dto.response;

import com.farmapp.farmsmartmanagement.domain.enums.PlotStatus;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.GeometryFormat;

import java.util.UUID;

public record PlotResponse(
        UUID id,

        String name,

        Long version,

        Double areaHa,

        PlotStatus status,

        GeometryFormat geometry
) {
}
