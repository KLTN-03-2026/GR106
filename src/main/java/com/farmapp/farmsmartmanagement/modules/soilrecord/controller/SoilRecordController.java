package com.farmapp.farmsmartmanagement.modules.soilrecord.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.request.CreateSoilRecordRequest;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.request.UpdateSoilRecordRequest;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.response.SoilRecordResponse;
import com.farmapp.farmsmartmanagement.modules.soilrecord.service.SoilRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Soil Record API", description = "Quản lý bản ghi đất (Soil Record) theo thửa đất")
public class SoilRecordController {

    SoilRecordService soilRecordService;

    @Operation(
            summary = "Tạo Soil Record mới",
            description = "API cho phép tạo bản ghi đất mới cho một thửa đất (plot)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/api/v1/plots/{plotId}/soil-records")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<SoilRecordResponse>> createSoilRecord(
            @PathVariable("plotId") UUID plotId,
            @RequestBody @Valid CreateSoilRecordRequest request
    ) {
        return ResponseUtil.created(
                soilRecordService.createSoilRecord(plotId, request)
        );
    }

    @Operation(
            summary = "Cập nhật Soil Record",
            description = "API cho phép cập nhật thông tin bản ghi đất (không thể cập nhật nếu đã bị khóa)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/api/v1/plots/{plotId}/soil-records/{soilRecordId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<SoilRecordResponse>> updateSoilRecord(
            @PathVariable("plotId") UUID plotId,
            @PathVariable("soilRecordId") UUID soilRecordId,
            @RequestBody @Valid UpdateSoilRecordRequest request
    ) {
        return ResponseUtil.success(
                soilRecordService.updateSoilRecord(soilRecordId, request)
        );
    }

    @Operation(
            summary = "Lấy tất cả Soil Record của Farm",
            description = "API trả về danh sách tất cả bản ghi đất thuộc farm hiện tại",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/soil-records")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<SoilRecordResponse>>> getAllByFarm() {
        return ResponseUtil.success(
                soilRecordService.findAllByFarmId()
        );
    }

    @Operation(
            summary = "Lấy tất cả Soil Record theo Plot",
            description = "API trả về danh sách bản ghi đất thuộc một thửa đất cụ thể",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/api/v1/plots/{plotId}/soil-records")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<SoilRecordResponse>>> getAllByPlot(
            @PathVariable("plotId") UUID plotId
    ) {
        return ResponseUtil.success(
                soilRecordService.findAllByPlotId(plotId)
        );
    }

    @Operation(
            summary = "Xóa mềm Soil Record",
            description = "API cho phép xóa mềm bản ghi đất (soft delete - đánh dấu deletedAt)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/api/v1/plots/{plotId}/soil-records/{soilRecordId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> deleteSoilRecord(
            @PathVariable("plotId") UUID plotId,
            @PathVariable("soilRecordId") UUID soilRecordId
    ) {
        soilRecordService.deleteSoilRecord(soilRecordId);
        return ResponseUtil.noContent();
    }
}