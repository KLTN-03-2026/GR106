package com.farmapp.farmsmartmanagement.modules.ai.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskSuggestion {
    private String title;
    private String description;
    private String priority;        // HIGH | MEDIUM | LOW
    private Short estimatedDays;
    private String category;        // WATERING | FERTILIZING | ...
}