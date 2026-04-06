package com.farmapp.farmsmartmanagement.modules.plot.dto.request;


import jakarta.validation.constraints.NotBlank;

public record CreatePlotRequest (
   @NotBlank(message = "Tên lô đất không được để trống")
   String plotName,

   GeometryFormat geometry,

   String description
){ }
