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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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
    private static final Pattern JSON_ARRAY_PATTERN =
            Pattern.compile("\\[\\s*\\{.*?\\}\\s*\\]", Pattern.DOTALL);

    // Retry config: tối đa 3 lần, backoff 2s → 4s → 8s, chỉ retry khi 429 hoặc 5xx
    private static final int    MAX_RETRY_ATTEMPTS  = 3;
    private static final long   RETRY_BACKOFF_MS    = 2_000L;

    // ═════════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═════════════════════════════════════════════════════════════════════════

    public List<TaskSuggestion> suggestTasks(String cropType, String stage) {
        return callGemini(buildFreeFormPrompt(cropType, stage), 0.3);
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
        PlanEntity plan     = planStage.getPlan();
        CropEntity crop     = plan.getCrop();
        String cropTypeName = crop.getCropType() != null ? crop.getCropType().getName() : "Không rõ";
        String cropStageName = planStage.getCropStage() != null
                ? planStage.getCropStage().getName() : planStage.getName();
        String cropStageDesc = planStage.getCropStage() != null
                ? planStage.getCropStage().getDescription() : null;
        Integer stageDuration = planStage.getCropStage() != null
                ? planStage.getCropStage().getDurationDays() : null;

        List<TaskSuggestion> suggestions = callGemini(
                buildContextualPrompt(
                        plan.getName(), plan.getStartDate(), plan.getEndDate(),
                        planStage.getName(), planStage.getStartDate(), planStage.getEndDate(),
                        crop.getName(), cropTypeName, cropStageName, cropStageDesc, stageDuration
                ), 0.25
        );

        if (!suggestions.isEmpty()) {
            aiCache.trySaveCache(planStage.getId(), farmId, suggestions);
        }

        return suggestions;
    }

    public List<TaskSuggestion> chatWithAi(String message, String cropType, String stage) {
        return callGemini(buildChatPrompt(message, cropType, stage), 0.4);
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

        long daysUntilEnd = stageEnd != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), stageEnd) : -1;

        String urgencyNote = "";
        if (daysUntilEnd >= 0 && daysUntilEnd <= 3) {
            urgencyNote = "\n⚠️ KHẨN: Giai đoạn này chỉ còn " + daysUntilEnd + " ngày.";
        } else if (daysUntilEnd > 3 && daysUntilEnd <= 7) {
            urgencyNote = "\nLưu ý: Còn " + daysUntilEnd + " ngày.";
        }

        return """
                Bạn là chuyên gia nông nghiệp Việt Nam với hơn 20 năm kinh nghiệm thực tiễn.

                KẾ HOẠCH: %s | %s → %s | Cây: %s | Loại: %s
                GIAI ĐOẠN: %s (%s) | %s → %s (%s ngày)%s
                %s

                Gợi ý ĐÚNG 5 công việc đặc thù cho giai đoạn này.
                Phù hợp sinh lý cây %s giai đoạn %s, hoàn thành trong %s ngày, khí hậu miền Nam VN.

                CHỈ trả về JSON array thuần túy, không markdown, không text thừa:
                [{"title":"tối đa 8 từ","description":"2-4 câu hướng dẫn cụ thể","priority":"HIGH|MEDIUM|LOW","estimatedDays":1,"category":"WATERING|FERTILIZING|PEST_CONTROL|PRUNING|HARVESTING|SOIL|OTHER"}]
                """.formatted(
                planName,
                planStart != null ? planStart.format(DATE_FMT) : "?",
                planEnd   != null ? planEnd.format(DATE_FMT)   : "?",
                cropName, cropType,
                stageName, cropStageName,
                stageStart != null ? stageStart.format(DATE_FMT) : "?",
                stageEnd   != null ? stageEnd.format(DATE_FMT)   : "?",
                stageWindowDays, urgencyNote,
                cropStageDesc != null ? "Mô tả: " + cropStageDesc : "",
                cropName, cropStageName,
                daysUntilEnd >= 0 ? daysUntilEnd : stageWindowDays
        );
    }

    private String buildFreeFormPrompt(String cropType, String stage) {
        return """
                Bạn là chuyên gia nông nghiệp Việt Nam với hơn 20 năm kinh nghiệm.
                Cây trồng: %s | Giai đoạn: %s

                Gợi ý ĐÚNG 5 công việc cần thực hiện, theo thứ tự ưu tiên, phù hợp khí hậu VN.
                CHỈ trả về JSON array thuần túy, không markdown, không text thừa:
                [{"title":"tên ngắn gọn","description":"2-3 câu hướng dẫn cụ thể","priority":"HIGH|MEDIUM|LOW","estimatedDays":1,"category":"WATERING|FERTILIZING|PEST_CONTROL|PRUNING|HARVESTING|SOIL|OTHER"}]
                """.formatted(cropType, stage);
    }

    private String buildChatPrompt(String message, String cropType, String stage) {
        String ctx = (cropType != null && !cropType.isBlank())
                ? "Cây: %s | Giai đoạn: %s\n".formatted(cropType, stage != null ? stage : "không rõ")
                : "";

        return """
                Bạn là chuyên gia nông nghiệp Việt Nam, trả lời thực tiễn.
                %sCâu hỏi: "%s"

                Trả về 3-5 gợi ý/hành động liên quan.
                CHỈ trả về JSON array thuần túy, không markdown, không text thừa:
                [{"title":"hành động chính","description":"2-4 câu tiếng Việt","priority":"HIGH|MEDIUM|LOW","estimatedDays":1,"category":"WATERING|FERTILIZING|PEST_CONTROL|PRUNING|HARVESTING|SOIL|OTHER"}]

                Nếu hỏi sâu bệnh → PEST_CONTROL + tên thuốc cụ thể.
                Nếu hỏi phân bón  → loại phân, liều lượng, thời điểm bón.
                """.formatted(ctx, message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // INTERNAL: API CALL + RETRY + PARSE
    // ═════════════════════════════════════════════════════════════════════════

    private List<TaskSuggestion> callGemini(String prompt, double temperature) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature",      temperature,
                        "maxOutputTokens",  2048,
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
                    // ── Retry: chỉ retry khi 429 hoặc 5xx ───────────────────
                    .retryWhen(
                            Retry.backoff(MAX_RETRY_ATTEMPTS, Duration.ofMillis(RETRY_BACKOFF_MS))
                                    .jitter(0.5)                          // jitter 50% tránh thundering herd
                                    .filter(this::isRetryable)
                                    .doBeforeRetry(signal -> log.warn(
                                            "[Gemini] Retry #{} sau lỗi: {}",
                                            signal.totalRetries() + 1,
                                            signal.failure().getMessage()
                                    ))
                                    .onRetryExhaustedThrow((spec, signal) ->
                                            new RuntimeException(
                                                    "[Gemini] Đã thử " + MAX_RETRY_ATTEMPTS
                                                            + " lần nhưng vẫn thất bại: "
                                                            + signal.failure().getMessage(),
                                                    signal.failure()
                                            )
                                    )
                    )
                    .block();

            log.debug("[Gemini] Raw response: {}", response);
            return parseResponse(response);

        } catch (Exception ex) {
            log.error("[Gemini] API call failed sau tất cả retry: {}", ex.getMessage());
            return List.of();
        }
    }

    /**
     * Chỉ retry khi:
     * - 429 Too Many Requests (rate limit)
     * - 5xx Server Error (lỗi phía Gemini)
     * Không retry 4xx khác (400 bad request, 401 auth…)
     */
    private boolean isRetryable(Throwable throwable) {
        if (throwable instanceof WebClientResponseException ex) {
            HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
            if (status == null) return false;
            return status == HttpStatus.TOO_MANY_REQUESTS || status.is5xxServerError();
        }
        // Retry lỗi network (timeout, connection reset…)
        return throwable instanceof java.io.IOException;
    }

    // ── Parse với 3 chiến lược ────────────────────────────────────────────────

    private List<TaskSuggestion> parseResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            log.warn("[Gemini] Empty response");
            return List.of();
        }

        try {
            JsonNode root       = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");

            if (candidates.isEmpty()) {
                log.warn("[Gemini] No candidates: {}", rawResponse);
                return List.of();
            }

            JsonNode first = candidates.get(0);
            String finishReason = first.path("finishReason").asText("");
            if ("MAX_TOKENS".equals(finishReason)) {
                log.warn("[Gemini] Response bị cắt do MAX_TOKENS");
            }

            String jsonText = first.path("content").path("parts").get(0).path("text").asText();
            if (jsonText == null || jsonText.isBlank()) {
                log.warn("[Gemini] Candidate text rỗng");
                return List.of();
            }

            return tryParseJsonText(jsonText);

        } catch (Exception ex) {
            log.error("[Gemini] Parse response thất bại: {}", ex.getMessage());
            return List.of();
        }
    }

    private List<TaskSuggestion> tryParseJsonText(String jsonText) {
        String trimmed = jsonText.trim();

        // Chiến lược 1: parse thẳng
        try {
            return objectMapper.readValue(trimmed,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, TaskSuggestion.class));
        } catch (Exception ignored) { }

        // Chiến lược 2: strip markdown fences
        String stripped = trimmed
                .replaceAll("(?s)^```json\\s*", "")
                .replaceAll("(?s)^```\\s*",     "")
                .replaceAll("(?s)\\s*```$",      "")
                .trim();
        try {
            return objectMapper.readValue(stripped,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, TaskSuggestion.class));
        } catch (Exception ignored) { }

        // Chiến lược 3: regex tìm JSON array
        Matcher matcher = JSON_ARRAY_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            try {
                return objectMapper.readValue(matcher.group(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TaskSuggestion.class));
            } catch (Exception ex) {
                log.error("[Gemini] Regex parse thất bại: {}", ex.getMessage());
            }
        }

        log.error("[Gemini] Tất cả chiến lược parse thất bại. Text: {}", jsonText);
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