package com.farmapp.farmsmartmanagement.modules.ai.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.annotation.RequiresSubscription;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionFeature;
import com.farmapp.farmsmartmanagement.modules.ai.dto.request.AiChatRequest;
import com.farmapp.farmsmartmanagement.modules.ai.dto.response.TaskSuggestion;
import com.farmapp.farmsmartmanagement.modules.ai.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Validated
@Tag(name = "AI Suggestion API", description = "Gợi ý công việc bằng AI")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiController {

    GeminiService geminiService;

    // ── 1. Free-form: nhập tay cropType + stage ───────────────────────────────
    @GetMapping("/suggest-tasks")
    @RequiresFarmToken
    @RequiresSubscription(features = SubscriptionFeature.AI_DIAGNOSIS)
    @Operation(
            summary = "Gợi ý công việc theo loại cây và giai đoạn (free-form)",
            description = "Dùng Google Gemini để gợi ý danh sách công việc. " +
                    "Phù hợp cho trang AI Assistant khi người dùng nhập tay.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<TaskSuggestion>>> suggestTasks(
            @Parameter(description = "Tên cây trồng, VD: Lúa ST25, Xoài cát")
            @RequestParam @NotBlank String cropType,
            @Parameter(description = "Giai đoạn canh tác, VD: Chăm sóc lúa con")
            @RequestParam @NotBlank String stage
    ) {
        return ResponseUtil.success(geminiService.suggestTasks(cropType, stage));
    }

    // ── 2. Context-aware: dựa trên planStage thực tế trong DB ─────────────────
    @GetMapping("/plans/{planId}/stages/{planStageId}/suggest-tasks")
    @RequiresFarmToken
    @RequiresSubscription(features = SubscriptionFeature.AI_DIAGNOSIS)
    @Operation(
            summary = "Gợi ý công việc thông minh theo giai đoạn kế hoạch",
            description = "Lấy đầy đủ context từ DB (tên kế hoạch, thời gian, cây trồng, " +
                    "loại cây, mô tả giai đoạn canh tác) để tạo gợi ý chất lượng cao nhất. " +
                    "Tự động nhận biết độ khẩn cấp dựa trên số ngày còn lại của giai đoạn.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<TaskSuggestion>>> suggestTasksByStage(
            @Parameter(description = "ID kế hoạch canh tác")
            @PathVariable UUID planId,
            @Parameter(description = "ID giai đoạn kế hoạch")
            @PathVariable UUID planStageId
    ) {
        return ResponseUtil.success(
                geminiService.suggestTasksByStageAndPlan(planStageId, planId)
        );
    }

    // ── 3. Chat tự do với AI ──────────────────────────────────────────────────
    @PostMapping("/chat")
    @RequiresFarmToken
    @RequiresSubscription(features = SubscriptionFeature.AI_DIAGNOSIS)
    @Operation(
            summary = "Chat với AI chuyên gia nông nghiệp",
            description = "Hỏi AI bất kỳ câu hỏi nào về canh tác. " +
                    "Có thể kèm cropType và stage để AI trả lời đúng ngữ cảnh hơn.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<TaskSuggestion>>> chat(
            @RequestBody AiChatRequest request
    ) {
        return ResponseUtil.success(geminiService.chatWithAi(
                request.getMessage(),
                request.getCropType(),
                request.getStage()
        ));
    }
}