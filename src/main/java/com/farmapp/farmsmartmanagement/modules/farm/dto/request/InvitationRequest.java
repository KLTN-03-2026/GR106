package com.farmapp.farmsmartmanagement.modules.farm.dto.request;

import com.farmapp.farmsmartmanagement.common.annotation.Sanitize;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvitationRequest {
    @Sanitize
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Sai định dạng mail")
    String email;

    @NotNull(message = "Vui lòng chọn vai trò cho người được mời")
    UUID roleId;
}
