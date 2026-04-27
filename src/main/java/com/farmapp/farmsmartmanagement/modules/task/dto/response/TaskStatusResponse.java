package com.farmapp.farmsmartmanagement.modules.task.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskStatusResponse {
    UUID id;
    String code;
    String name;
    String color;
}
