package com.farmapp.farmsmartmanagement.modules.task.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTaskRequest {
    @NotNull(message = "Version không được để trống")
    Long version;


    String name;
    String description;
    LocalDate startDate;
    LocalDate endDate;

    UUID plotId;


    @JsonIgnore
    @AssertTrue(message = "Thời gian bắt đầu phải trước thời gian kết thúc")
    private boolean isDateRangeValid() {
        if (startDate == null || endDate == null) return true;
        return !startDate.isAfter(endDate);
    }

    @JsonIgnore
    @AssertTrue(message = "Thời gian kết thúc không được nằm trong quá khứ")
    private boolean isEndDateValid() {
        if (endDate == null) return true;
        return !endDate.isBefore(LocalDate.now());
    }

}
