package com.farmapp.farmsmartmanagement.modules.plot.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.CreatePlotRequest;
import com.farmapp.farmsmartmanagement.modules.plot.dto.response.PlotResponse;
import com.farmapp.farmsmartmanagement.modules.plot.service.PlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plots")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Plot API", description = "Quản lý lô đất (plots) trong farm")
public class PlotController {

    PlotService plotService;

    // ========================= 1. GET ALL =========================
    @Operation(
            summary = "Lấy danh sách lô đất",
            description = "API trả về toàn bộ lô đất trong hệ thống"
    )
    @GetMapping
    public ApiResponse<List<PlotResponse>> getAllPlots() {
        return ApiResponse.success(plotService.getAllPlots());
    }

    // ========================= 2. CREATE =========================
    @Operation(
            summary = "Tạo lô đất mới",
            description = "Tạo một plot mới thuộc farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ApiResponse<PlotResponse> createPlot(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin lô đất cần tạo",
                    required = true
            )
            @RequestBody @Valid CreatePlotRequest request
    ) {
        return ApiResponse.created(
                plotService.createPlot(principal.getFarmId(), request)
        );
    }
}