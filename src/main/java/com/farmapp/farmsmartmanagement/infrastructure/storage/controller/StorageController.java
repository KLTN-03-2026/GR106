package com.farmapp.farmsmartmanagement.infrastructure.storage.controller;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.infrastructure.storage.dto.PresignedUploadRequest;
import com.farmapp.farmsmartmanagement.infrastructure.storage.dto.PresignedUploadResponse;
import com.farmapp.farmsmartmanagement.infrastructure.storage.service.R2StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
@Tag(name = "Storage API", description = "Upload file lên Cloudflare R2")
public class StorageController {

    private final R2StorageService r2StorageService;

    @Operation(
            summary = "Lấy Presigned URL để upload file",
            description = """
                    Trả về:
                    - `uploadUrl`: Client dùng HTTP PUT để upload file trực tiếp lên R2 (không qua server).
                    - `fileUrl`: URL public của file sau khi upload thành công. Lưu giá trị này vào `sourceFileUrl` khi tạo/cập nhật SoilRecord.
                    - `objectKey`: Key của object trên R2.
                    - `expiresInSeconds`: Thời gian hết hạn của uploadUrl.
                    
                    **Cách dùng phía client:**
                    ```
                    PUT {uploadUrl}
                    Content-Type: {contentType bạn đã truyền vào request}
                    Body: <binary file>
                    ```
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/presigned-url")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<PresignedUploadResponse>> getPresignedUploadUrl(
            @RequestBody @Valid PresignedUploadRequest request
    ) {
        return ResponseUtil.success(
                r2StorageService.generatePresignedUploadUrl(request)
        );
    }
}