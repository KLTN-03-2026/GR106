package com.farmapp.farmsmartmanagement.modules.worksession.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class WorkSessionResponse {
    UUID id;
    UUID taskId;
    String taskName;
    UUID employeeId;
    String employeeName;
    Instant checkedInAt;
    Instant checkedOutAt;
    String checkInNote;
    String checkOutNote;
    boolean isOpen;
    boolean isForceClose;
    // Force close info (null nếu không bị force)
    String forceReason;
    Instant forceClosedAt;
    String forceClosedBy;
    // Adjustment info (null nếu không điều chỉnh)
    Instant checkedOutAtOriginal;
    String adjustReason;
    Instant adjustedAt;
    String adjustedBy;
    UUID workLogId;
    Instant createdAt;
}