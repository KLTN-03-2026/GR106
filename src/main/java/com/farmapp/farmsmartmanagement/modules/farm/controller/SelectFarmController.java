package com.farmapp.farmsmartmanagement.modules.farm.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSelectResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.FarmAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
@Tag(name = "Farm API", description = "Chọn farm và cấp Farm Token (multi-tenant)")
public class SelectFarmController {

    private final FarmAuthService farmAuthService;

    // ========================= SELECT FARM =========================
    @Operation(
            summary = "Chọn farm",
            description = """
                    API cho phép user chọn farm để làm việc.

                    Flow:
                    1. User đăng nhập → nhận User Token (chưa có farmId)
                    2. Gọi API này với farmId
                    3. Server trả về Farm Token (có farmId + permissions)
                    4. Client dùng token này cho các API tiếp theo
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{farmId}/select")
    public ApiResponse<FarmSelectResponse> selectFarm(

            @Parameter(
                    description = "ID của farm cần chọn",
                    required = true,
                    example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0"
            )
            @PathVariable UUID farmId,

            @Parameter(hidden = true)
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.success(
                farmAuthService.selectFarm(principal.getUserId(), farmId)
        );
    }
}