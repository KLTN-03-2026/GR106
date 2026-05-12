package com.farmapp.farmsmartmanagement.modules.ai.service;

import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlanStageAiSuggestionCacheRepository;
import com.farmapp.farmsmartmanagement.modules.ai.dto.response.TaskSuggestion;
import com.farmapp.farmsmartmanagement.modules.plan.validation.PlanStageValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final PlanStageValidator planStageValidator;
    private final SecurityUtils securityUtils;
    private final PlanStageAiSuggestionCacheRepository planStageAiSuggestionCacheRepository;
    private final AiCache aiCache;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ─── Regex bắt JSON array dù có markdown fence hay text thừa ─────────────
    private static final Pattern JSON_ARRAY_PATTERN =
            Pattern.compile("\\[\\s*\\{.*?\\}\\s*\\]", Pattern.DOTALL);

    // ═════════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═════════════════════════════════════════════════════════════════════════

    public List<TaskSuggestion> suggestTasks(String cropType, String stage) {
        String prompt = buildFreeFormPrompt(cropType, stage);
        return callGemini(prompt, 0.3);
    }

    public List<TaskSuggestion> suggestTasksByStageAndPlan(UUID planStageId, UUID planId) {
        UUID farmId = securityUtils.getCurrentFarmId();
        PlanStageEntity planStage = planStageValidator.validateAndGetStage(planStageId, planId, farmId);

        // ── 1. Trả cache nếu đã có ────────────────────────────────────────────
        List<PlanStageAiSuggestionCacheEntity> cached =
                planStageAiSuggestionCacheRepository.findByPlanStageId(planStage.getId());

        if (!cached.isEmpty()) {
            return cached.stream()
                    .map(i -> TaskSuggestion.builder()
                            .title(i.getTitle())
                            .description(i.getDescription())
                            .priority(convertPriority(i.getPriority()))
                            .estimatedDays(i.getEstimatedDays())
                            .category(i.getCategory())
                            .build())
                    .toList();
        }

        // ── 2. Gọi Gemini ─────────────────────────────────────────────────────
        PlanEntity plan = planStage.getPlan();
        CropEntity crop = plan.getCrop();

        String cropTypeName  = crop.getCropType() != null ? crop.getCropType().getName() : "Không rõ";
        String cropStageName = planStage.getCropStage() != null
                ? planStage.getCropStage().getName() : planStage.getName();
        String cropStageDesc = planStage.getCropStage() != null
                ? planStage.getCropStage().getDescription() : null;
        Integer stageDuration = planStage.getCropStage() != null
                ? planStage.getCropStage().getDurationDays() : null;

        String prompt = buildContextualPrompt(
                plan.getName(), plan.getStartDate(), plan.getEndDate(),
                planStage.getName(), planStage.getStartDate(), planStage.getEndDate(),
                crop.getName(), cropTypeName, cropStageName, cropStageDesc, stageDuration
        );

        List<TaskSuggestion> suggestions = callGemini(prompt, 0.25);

        // ── 3. Lưu cache ──────────────────────────────────────────────────────
        if (!suggestions.isEmpty()) {
            aiCache.trySaveCache(planStage.getId(), farmId, suggestions);
        }

        return suggestions;
    }

    public List<TaskSuggestion> chatWithAi(String message, String cropType, String stage) {
        String prompt = buildChatPrompt(message, cropType, stage);
        return callGemini(prompt, 0.4);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // PROMPT BUILDERS
    // ═════════════════════════════════════════════════════════════════════════

    private String buildContextualPrompt(
            String planName, LocalDate planStart, LocalDate planEnd,
            String stageName, LocalDate stageStart, LocalDate stageEnd,
            String cropName, String cropType,
            String cropStageName, String cropStageDesc, Integer stageDurationDays
    ) {
        long stageWindowDays = (stageStart != null && stageEnd != null)
                ? ChronoUnit.DAYS.between(stageStart, stageEnd) + 1
                : (stageDurationDays != null ? stageDurationDays : 0);

        long daysUntilEnd = (stageEnd != null)
                ? ChronoUnit.DAYS.between(LocalDate.now(), stageEnd) : -1;

        String urgencyNote = "";
        if (daysUntilEnd >= 0 && daysUntilEnd <= 3) {
            urgencyNote = "\n⚠️ KHẨN: Giai đoạn này chỉ còn " + daysUntilEnd
                    + " ngày — ưu tiên công việc cấp bách, thời gian thực hiện ngắn.";
        } else if (daysUntilEnd > 3 && daysUntilEnd <= 7) {
            urgencyNote = "\nLưu ý: Còn " + daysUntilEnd
                    + " ngày — cân bằng giữa công việc định kỳ và chuẩn bị cho giai đoạn tiếp theo.";
        }

        return """
                Bạn là chuyên gia nông nghiệp Việt Nam với hơn 20 năm kinh nghiệm thực tiễn.
                Nhiệm vụ: Gợi ý danh sách công việc canh tác cụ thể, khả thi và hiệu quả nhất.

                ══════════════════════════════════════
                THÔNG TIN KẾ HOẠCH CANH TÁC
                ══════════════════════════════════════
                Tên kế hoạch   : %s
                Thời gian KH   : %s → %s
                Cây trồng      : %s
                Loại cây       : %s

                ══════════════════════════════════════
                THÔNG TIN GIAI ĐOẠN HIỆN TẠI
                ══════════════════════════════════════
                Tên giai đoạn     : %s
                Giai đoạn canh tác: %s
                Thời gian         : %s → %s (%s ngày)%s
                %s

                ══════════════════════════════════════
                YÊU CẦU OUTPUT — ĐỌC KỸ TRƯỚC KHI TRẢ LỜI
                ══════════════════════════════════════
                - Gợi ý ĐÚNG 5 công việc, không hơn, không kém.
                - Phù hợp đặc điểm sinh lý cây %s ở giai đoạn %s.
                - Có thể hoàn thành trong %s ngày.
                - Cụ thể về liều lượng, thời điểm, phương pháp.
                - Phù hợp khí hậu miền Nam Việt Nam.

                QUAN TRỌNG: Chỉ trả về JSON array thuần túy như mẫu dưới đây.
                Không có markdown, không có ```json, không có text giải thích trước hoặc sau.

                [
                  {
                    "title": "Tên công việc tối đa 8 từ",
                    "description": "Hướng dẫn cụ thể: liều lượng, thời điểm, cách thực hiện (2-4 câu)",
                    "priority": "HIGH",
                    "estimatedDays": 1,
                    "category": "WATERING"
                  }
                ]

                Giá trị hợp lệ — priority: HIGH | MEDIUM | LOW
                Giá trị hợp lệ — category: WATERING | FERTILIZING | PEST_CONTROL | PRUNING | HARVESTING | SOIL | OTHER
                """.formatted(
                planName,
                planStart != null ? planStart.format(DATE_FMT) : "?",
                planEnd   != null ? planEnd.format(DATE_FMT)   : "?",
                cropName, cropType,
                stageName, cropStageName,
                stageStart != null ? stageStart.format(DATE_FMT) : "?",
                stageEnd   != null ? stageEnd.format(DATE_FMT)   : "?",
                stageWindowDays, urgencyNote,
                cropStageDesc != null ? "Mô tả giai đoạn: " + cropStageDesc : "",
                cropName, cropStageName,
                daysUntilEnd >= 0 ? daysUntilEnd : stageWindowDays
        );
    }

    private String buildFreeFormPrompt(String cropType, String stage) {
        return """
                Bạn là chuyên gia nông nghiệp Việt Nam với hơn 20 năm kinh nghiệm.

                Thông tin canh tác:
                - Loại/tên cây trồng : %s
                - Giai đoạn canh tác  : %s

                Gợi ý ĐÚNG 5 công việc cần thực hiện trong giai đoạn này, theo thứ tự ưu tiên.
                Mỗi công việc phải cụ thể, có liều lượng hoặc phương pháp thực hiện rõ ràng.
                Phù hợp điều kiện khí hậu và tập quán canh tác Việt Nam.

                QUAN TRỌNG: Chỉ trả về JSON array thuần túy, không markdown, không text thừa.

                [
                  {
                    "title": "Tên công việc ngắn gọn",
                    "description": "Hướng dẫn cụ thể: liều lượng, thời điểm, cách thực hiện (2-3 câu)",
                    "priority": "HIGH",
                    "estimatedDays": 1,
                    "category": "WATERING"
                  }
                ]

                Giá trị hợp lệ — priority: HIGH | MEDIUM | LOW
                Giá trị hợp lệ — category: WATERING | FERTILIZING | PEST_CONTROL | PRUNING | HARVESTING | SOIL | OTHER
                """.formatted(cropType, stage);
    }

    private String buildChatPrompt(String message, String cropType, String stage) {
        String contextBlock = (cropType != null && !cropType.isBlank())
                ? """
                  Bối cảnh canh tác hiện tại:
                  - Cây trồng  : %s
                  - Giai đoạn  : %s

                  """.formatted(cropType, stage != null ? stage : "không rõ")
                : "";

        return """
                Bạn là chuyên gia nông nghiệp Việt Nam, trả lời ngắn gọn và thực tiễn.

                %sCâu hỏi của người dùng:
                "%s"

                Trả về 3-5 gợi ý/hành động liên quan đến câu hỏi.

                QUAN TRỌNG: Chỉ trả về JSON array thuần túy, không markdown, không text thừa.

                [
                  {
                    "title": "Hành động hoặc khái niệm chính",
                    "description": "Giải thích hoặc hướng dẫn cụ thể (2-4 câu, tiếng Việt)",
                    "priority": "HIGH",
                    "estimatedDays": 1,
                    "category": "WATERING"
                  }
                ]

                Giá trị hợp lệ — priority: HIGH | MEDIUM | LOW
                Giá trị hợp lệ — category: WATERING | FERTILIZING | PEST_CONTROL | PRUNING | HARVESTING | SOIL | OTHER
                Nếu câu hỏi về sâu bệnh → ưu tiên PEST_CONTROL với tên thuốc cụ thể.
                Nếu câu hỏi về phân bón  → ghi rõ loại phân, liều lượng, thời điểm bón.
                """.formatted(contextBlock, message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // INTERNAL: API CALL + PARSE
    // ═════════════════════════════════════════════════════════════════════════

    private List<TaskSuggestion> callGemini(String prompt, double temperature) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", temperature,
                        "maxOutputTokens", 2048,           // giảm từ 8192 → tránh response quá dài gây lỗi parse
                        "responseMimeType", "application/json"
                )
        );

        try {
            String response = webClientBuilder.build()
                    .post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("[Gemini] Raw response: {}", response);
            return parseResponse(response);

        } catch (Exception ex) {
            log.error("[Gemini] API call failed: {}", ex.getMessage(), ex);
            return List.of();
        }
    }

    /**
     * Parse response từ Gemini với nhiều fallback:
     * 1. Parse trực tiếp text từ candidate (happy path)
     * 2. Strip markdown fences rồi parse lại
     * 3. Dùng regex tìm JSON array trong text thừa
     * 4. Trả List.of() thay vì throw — client không bị lỗi 500
     */
    private List<TaskSuggestion> parseResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            log.warn("[Gemini] Empty response received");
            return List.of();
        }

        try {
            JsonNode root = objectMapper.readTree(rawResponse);

            // Kiểm tra finish_reason — nếu bị cắt (MAX_TOKENS) thì log cảnh báo
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                log.warn("[Gemini] No candidates in response: {}", rawResponse);
                return List.of();
            }

            JsonNode firstCandidate = candidates.get(0);
            String finishReason = firstCandidate.path("finishReason").asText("");
            if ("MAX_TOKENS".equals(finishReason)) {
                log.warn("[Gemini] Response truncated by MAX_TOKENS — consider increasing maxOutputTokens or shortening prompt");
            }

            String jsonText = firstCandidate
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();

            if (jsonText == null || jsonText.isBlank()) {
                log.warn("[Gemini] Empty text in candidate");
                return List.of();
            }

            return tryParseJsonText(jsonText);

        } catch (Exception ex) {
            log.error("[Gemini] Failed to parse response structure: {}", ex.getMessage());
            return List.of();
        }
    }

    /**
     * Thử parse JSON text với 3 chiến lược:
     * 1. Parse thẳng (model đã trả JSON sạch)
     * 2. Strip markdown fences (```json ... ```)
     * 3. Regex tìm [...] đầu tiên trong chuỗi
     */
    private List<TaskSuggestion> tryParseJsonText(String jsonText) {
        String trimmed = jsonText.trim();

        // Chiến lược 1: parse thẳng
        try {
            return objectMapper.readValue(
                    trimmed,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, TaskSuggestion.class)
            );
        } catch (Exception ignored) {
            log.debug("[Gemini] Direct parse failed, trying strip markdown...");
        }

        // Chiến lược 2: strip markdown fences
        String stripped = trimmed
                .replaceAll("(?s)^```json\\s*", "")
                .replaceAll("(?s)^```\\s*",     "")
                .replaceAll("(?s)\\s*```$",      "")
                .trim();

        try {
            return objectMapper.readValue(
                    stripped,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, TaskSuggestion.class)
            );
        } catch (Exception ignored) {
            log.debug("[Gemini] Stripped parse failed, trying regex extraction...");
        }

        // Chiến lược 3: regex tìm JSON array trong text thừa
        Matcher matcher = JSON_ARRAY_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            String extracted = matcher.group();
            try {
                return objectMapper.readValue(
                        extracted,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TaskSuggestion.class)
                );
            } catch (Exception ex) {
                log.error("[Gemini] Regex-extracted JSON still invalid: {}", ex.getMessage());
            }
        }

        log.error("[Gemini] All parse strategies failed. Raw text: {}", jsonText);
        return List.of();
    }

    private String convertPriority(Short priority) {
        if (priority == null) return null;
        return switch (priority) {
            case 1 -> "HIGH";
            case 2 -> "MEDIUM";
            case 3 -> "LOW";
            default -> "UNKNOWN";
        };
    }
}