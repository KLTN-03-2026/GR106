package com.farmapp.farmsmartmanagement.infrastructure.storage.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PresignedUploadResponse {

    /**
     * URL có chữ ký để client PUT file lên R2.
     * Hết hạn sau presignedUrlExpirationSeconds giây.
     */
    private String uploadUrl;

    /**
     * URL public để truy cập file sau khi upload thành công.
     * Client lưu giá trị này vào sourceFileUrl khi tạo/update SoilRecord.
     */
    private String fileUrl;

    /**
     * Key (đường dẫn) của object trên R2. VD: soil-records/uuid-filename.pdf
     */
    private String objectKey;

    /**
     * Thời gian hết hạn của uploadUrl (giây).
     */
    private long expiresInSeconds;
}