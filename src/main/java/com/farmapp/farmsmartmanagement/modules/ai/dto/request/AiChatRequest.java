package com.farmapp.farmsmartmanagement.modules.ai.dto.request;

import lombok.Data;

@Data
public class AiChatRequest {
    private String message;
    private String cropType;
    private String stage;
}