package com.farmapp.farmsmartmanagement.modules.ai.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageAiSuggestionCacheEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanStageEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlanStageAiSuggestionCacheRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlanStageRepository;
import com.farmapp.farmsmartmanagement.modules.ai.dto.response.TaskSuggestion;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AiCache {
    PlanStageAiSuggestionCacheRepository cacheRepository;
    PlanStageRepository planStageRepository;
    FarmRepository farmRepository;

    /**
     * Chỉ nhận primitive IDs — không nhận entity để tránh detached entity
     * crossing transaction boundary gây version conflict.
     *
     * Root cause của 409: PlanStageEntity được load ở transaction cha,
     * truyền sang REQUIRES_NEW → Hibernate coi là detached → merge → conflict version.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void trySaveCache(UUID planStageId,
                             UUID farmId,
                             List<TaskSuggestion> suggestions) {

        // Double-check bằng fresh query trong transaction mới
        if (cacheRepository.existsByPlanStage_Id(planStageId)) {
            log.debug("[AI Cache] Stage {} đã có cache, bỏ qua", planStageId);
            return;
        }

        // Load fresh proxy references trong transaction này — không copy state từ transaction cha
        PlanStageEntity planStage = planStageRepository.getReferenceById(planStageId);
        FarmEntity farm           = farmRepository.getReferenceById(farmId);

        List<PlanStageAiSuggestionCacheEntity> cache = suggestions.stream()
                .map(i -> PlanStageAiSuggestionCacheEntity.builder()
                        .title(i.getTitle())
                        .description(i.getDescription())
                        .estimatedDays(i.getEstimatedDays())
                        .category(i.getCategory())
                        .priority(convertPriority(i.getPriority()))
                        .planStage(planStage)
                        .farm(farm)
                        .createdAt(Instant.now())
                        .build())
                .toList();

        try {
            cacheRepository.saveAll(cache);
            log.debug("[AI Cache] Lưu {} gợi ý cho stage {}", cache.size(), planStageId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("[AI Cache] Race condition stage {}, bỏ qua", planStageId);
        }
    }
    private Short convertPriority(String priority) {
        if (priority == null) return null;
        return switch (priority) {
            case "HIGH" -> 1;
            case "MEDIUM" -> 2;
            case "LOW" -> 3;
            default -> 4;
        };
    }
}
