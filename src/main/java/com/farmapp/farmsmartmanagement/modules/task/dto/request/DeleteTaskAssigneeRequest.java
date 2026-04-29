package com.farmapp.farmsmartmanagement.modules.task.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeleteTaskAssigneeRequest {
    @Sanitize
    String removalReason;
}
