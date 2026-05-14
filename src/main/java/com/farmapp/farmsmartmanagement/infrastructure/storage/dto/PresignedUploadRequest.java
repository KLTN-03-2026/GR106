package com.farmapp.farmsmartmanagement.infrastructure.storage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PresignedUploadRequest {

    @NotBlank(message = "Tên file không được để trống")
    private String fileName;

    /**
     * MIME type của file.
     * Cho phép: image/jpeg, image/png, application/pdf,
     *           application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
     *           text/csv
     */
    @NotBlank(message = "Content type không được để trống")
    @Pattern(
            regexp = "image/jpeg|image/png|application/pdf"
                    + "|application/vnd\\.ms-excel"
                    + "|application/vnd\\.openxmlformats-officedocument\\.spreadsheetml\\.sheet"
                    + "|text/csv",
            message = "Loại file không được hỗ trợ"
    )
    private String contentType;

    /**
     * Folder lưu trữ trên R2. VD: "soil-records", "harvest-records"
     * Nếu null thì lưu vào thư mục gốc.
     */
    private String folder;
}