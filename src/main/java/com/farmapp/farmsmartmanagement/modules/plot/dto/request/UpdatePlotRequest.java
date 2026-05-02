package com.farmapp.farmsmartmanagement.modules.plot.dto.request;


import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import com.farmapp.farmsmartmanagement.domain.enums.PlotStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePlotRequest {

    @NotNull(message = "Version không được để trống")
    Long version;

    @Sanitize
    String name;

    PlotStatus status;

    GeometryFormat geometry;

    @Sanitize
    String description;

    Boolean isClearDescription;

    Boolean isClearGeometry;
}
