package com.farmapp.farmsmartmanagement.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ==================== COMMON ====================
    INTERNAL_SERVER_ERROR(500, "Lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(400, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(404, "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(401, "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    CONFLICT(409, "Dữ liệu đã tồn tại", HttpStatus.CONFLICT),
    INVALID_REFRESH_TOKEN(401, "Refresh token không hợp lệ", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(401, "Refresh token đã hết hạn", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_REUSED(401, "Phát hiện token bị đánh cắp, đã đăng xuất tất cả thiết bị", HttpStatus.UNAUTHORIZED),
    ACCOUNT_HAS_BEEN_BLOCKED(401,"Tài khoản đã bị khoá", HttpStatus.CONFLICT),
    EMAIL_EXISTED(401, "Email đã tồn tại", HttpStatus.CONFLICT),
    EMAIL_NOT_FOUND(404,"Không tìm thấy Email, vui lòng đăng ký",HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_VERIFIED(401,"Tài khoản chưa được xác nhận", HttpStatus.UNAUTHORIZED),
    USER_NOT_EXISTED(404, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    DEFAULT_SUBSCRIPTION_PLAN_NOT_FOUND(404, "Không tìm thấy gói đăng ký mặc định" ,HttpStatus.NOT_FOUND ),
    FARM_NOT_FOUND(404, "Không tìm thấy trang trại" , HttpStatus.NOT_FOUND),
    SUBSCRIPTION_PLAN_NOT_FOUND(404, "Không tìm thấy gói đăng ký", HttpStatus.NOT_FOUND ),
    PAYMENT_NOT_FOUND(404, "Payment transaction not found", HttpStatus.NOT_FOUND),
    PAYMENT_INVALID_SIGNATURE(400,     "Invalid payment signature", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED(409,      "Payment already processed", HttpStatus.CONFLICT),
    PAYMENT_EXPIRED(410,                "Payment link has expired", HttpStatus.CONFLICT),
    PAYMENT_AMOUNT_MISMATCH(422,        "Payment amount does not match", HttpStatus.CONFLICT),
    PAYMENT_GATEWAY_ERROR(502,          "Payment gateway error", HttpStatus.INTERNAL_SERVER_ERROR),


    FARM_SUBSCRIPTION_NOT_FOUND(404, "Không tìm thấy farm đang đăng ký gói nào", HttpStatus.NOT_FOUND ),;

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}