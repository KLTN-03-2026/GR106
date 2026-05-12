package com.farmapp.farmsmartmanagement.modules.ai.dto.response;

import lombok.Data;

@Data
public class TaskSuggestion {
    private String title;
    private String description;
    private String priority;        // HIGH | MEDIUM | LOW
    private Integer estimatedDays;
    private String category;        // WATERING | FERTILIZING | ...
}