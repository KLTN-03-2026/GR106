package com.farmapp.farmsmartmanagement.modules.worksession.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckOutRequest {

    String checkOutNote;

//    @NotNull(message = "Shift không được để trống")
    UUID shiftId; // xác định ca khi checkout để tạo work_log
}