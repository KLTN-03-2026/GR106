package com.farmapp.farmsmartmanagement.modules.plot.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.CreatePlotRequest;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.UpdatePlotRequest;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
            description = "API trả về toàn bộ lô đất trong farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @RequiresFarmToken
    @GetMapping
    public ResponseEntity<ApiResponse<List<PlotResponse>>> getAllPlots() {
        return ResponseUtil
                .success(
                        plotService.getAllPlots()
                );
    }

    // ========================= 2. CREATE =========================
    @Operation(
            summary = "Tạo lô đất mới",
            description = "API cho phép tạo một lô đất (plot) mới thuộc farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @RequiresFarmToken
    @PostMapping
    public ResponseEntity<ApiResponse<PlotResponse>> createPlot(
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreatePlotRequest request
    ) {
        return ResponseUtil
                .created(
                        plotService.createPlot(principal.getFarmId(), request)
                );
    }

    // ========================= 3. UPDATE =========================
    @Operation(
            summary = "Cập nhật lô đất",
            description = "API cho phép cập nhật thông tin của một lô đất theo ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @RequiresFarmToken
    @PatchMapping("/{plotId}")
    public ResponseEntity<ApiResponse<PlotResponse>> updatePlot(
            @Parameter(description = "ID của lô đất", required = true)
            @PathVariable UUID plotId,
            @RequestBody @Valid UpdatePlotRequest request,
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal
    ){
        return ResponseUtil.success(
                plotService.updatePlot(
                        principal.getFarmId(), plotId, request
                )
        );
    }

    // ========================= 4. DELETE =========================
    @Operation(
            summary = "Xóa lô đất",
            description = "API cho phép xóa một lô đất khỏi farm theo ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @RequiresFarmToken
    @DeleteMapping("/{plotId}")
    public ResponseEntity<ApiResponse<Void>> deletePlot(
            @Parameter(description = "ID của lô đất", required = true)
            @PathVariable UUID plotId,
            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal
    ){
        plotService.deletePlot(principal.getFarmId(), plotId);

        return ResponseUtil.noContent();
    }
}