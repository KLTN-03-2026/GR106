package com.farmapp.farmsmartmanagement.modules.plot.controller;


import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.CreatePlotRequest;
import com.farmapp.farmsmartmanagement.modules.plot.dto.response.PlotResponse;
import com.farmapp.farmsmartmanagement.modules.plot.service.PlotService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/plots")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlotController {

    PlotService plotService;


    @GetMapping
    public ApiResponse<List<PlotResponse>> getAllPlots() {
        return ApiResponse.success(plotService.getAllPlots());
    }

    @PostMapping
    public ApiResponse<PlotResponse> createPlot(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody@Valid CreatePlotRequest request
            ) {
        return ApiResponse.created(
                plotService.createPlot(principal.getFarmId(), request)
        );
    }


}
