package com.farmapp.farmsmartmanagement.modules.plot.dto.request;


import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePlotRequest {

    @Sanitize
    @NotBlank(message = "Tên lô đất không được để trống")
    String plotName;

    GeometryFormat geometry;

    @Sanitize
    String description;
}

