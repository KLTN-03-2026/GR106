package com.farmapp.farmsmartmanagement.infrastructure.storage.service;

import com.farmapp.farmsmartmanagement.config.app.R2Properties;
import com.farmapp.farmsmartmanagement.infrastructure.storage.dto.PresignedUploadRequest;
import com.farmapp.farmsmartmanagement.infrastructure.storage.dto.PresignedUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.S3Client;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class R2StorageService {

    private final S3Presigner r2S3Presigner;
    private final S3Client r2S3Client;
    private final R2Properties r2Properties;

    /**
     * Tạo presigned URL để client upload file trực tiếp lên R2.
     */
    public PresignedUploadResponse generatePresignedUploadUrl(PresignedUploadRequest request) {
        String objectKey = buildObjectKey(request.getFolder(), request.getFileName());

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(r2Properties.getBucketName())
                .key(objectKey)
                .contentType(request.getContentType())
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(r2Properties.getPresignedUrlExpirationSeconds()))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = r2S3Presigner.presignPutObject(presignRequest);

        String uploadUrl = presignedRequest.url().toString();
        String fileUrl = buildPublicFileUrl(objectKey);

        log.info("Generated presigned URL for object: {}", objectKey);

        return PresignedUploadResponse.builder()
                .uploadUrl(uploadUrl)
                .fileUrl(fileUrl)
                .objectKey(objectKey)
                .expiresInSeconds(r2Properties.getPresignedUrlExpirationSeconds())
                .build();
    }

    /**
     * Xóa object khỏi R2 theo objectKey.
     * VD: objectKey = "soil-records/uuid-filename.pdf"
     */
    public void deleteObject(String objectKey) {
        try {
            r2S3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .build());
            log.info("Deleted object from R2: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete object from R2: {}", objectKey, e);
        }
    }

    /**
     * Trích xuất objectKey từ fileUrl public.
     * VD: "https://cdn.example.com/soil-records/abc.pdf" → "soil-records/abc.pdf"
     */
    public String extractObjectKeyFromUrl(String fileUrl) {
        String baseUrl = r2Properties.getPublicBaseUrl();
        if (fileUrl != null && fileUrl.startsWith(baseUrl)) {
            return fileUrl.substring(baseUrl.length()).replaceFirst("^/", "");
        }
        return fileUrl; // fallback: trả nguyên nếu không parse được
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private String buildObjectKey(String folder, String originalFileName) {
        String sanitized = sanitizeFileName(originalFileName);
        String uniqueName = UUID.randomUUID() + "-" + sanitized;
        if (folder != null && !folder.isBlank()) {
            return folder.replaceAll("/$", "") + "/" + uniqueName;
        }
        return uniqueName;
    }

    private String buildPublicFileUrl(String objectKey) {
        String base = r2Properties.getPublicBaseUrl().replaceAll("/$", "");
        return base + "/" + objectKey;
    }

    /**
     * Loại bỏ ký tự đặc biệt, giữ lại chữ/số/dấu chấm/gạch ngang/gạch dưới.
     */
    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
    }
}