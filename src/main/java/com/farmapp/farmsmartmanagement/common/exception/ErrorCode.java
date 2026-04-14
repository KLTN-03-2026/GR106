package com.farmapp.farmsmartmanagement.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // --- System ---
    INTERNAL_SERVER_ERROR(500, "Lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_GATEWAY_ERROR(502, "Payment gateway error", HttpStatus.BAD_GATEWAY), // 502 → BAD_GATEWAY

    // --- Request ---
    INVALID_REQUEST(400, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_AMOUNT(400, "Số tiền thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),
    PAYMENT_INVALID_SIGNATURE(400, "Invalid payment signature", HttpStatus.BAD_REQUEST),

    // --- Auth ---
    UNAUTHORIZED(401, "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    FARM_TOKEN_REQUIRED(403, "Endpoint này yêu cầu farm token", HttpStatus.FORBIDDEN),

    // --- Token ---
    INVALID_REFRESH_TOKEN(401, "Refresh token không hợp lệ", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(401, "Refresh token đã hết hạn", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_REUSED(401, "Phát hiện token bị đánh cắp, đã đăng xuất tất cả thiết bị", HttpStatus.UNAUTHORIZED),

    // --- Account ---
    ACCOUNT_HAS_BEEN_BLOCKED(409, "Tài khoản đã bị khoá", HttpStatus.CONFLICT),      // sửa code 401→409
    ACCOUNT_NOT_VERIFIED(401, "Tài khoản chưa được xác nhận", HttpStatus.UNAUTHORIZED),
    EMAIL_EXISTED(409, "Email đã tồn tại", HttpStatus.CONFLICT),                      // sửa code 401→409
    EMAIL_NOT_FOUND(404, "Không tìm thấy Email, vui lòng đăng ký", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(404, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(404, "Không tìm thấy vai trò", HttpStatus.NOT_FOUND),

    // --- Not found ---
    FARM_NOT_FOUND(404, "Không tìm thấy trang trại", HttpStatus.NOT_FOUND),
    FARM_SUBSCRIPTION_NOT_FOUND(404, "Không tìm thấy trang trại đang đăng ký gói nào", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_PLAN_NOT_FOUND(404, "Không tìm thấy gói đăng ký", HttpStatus.NOT_FOUND),
    DEFAULT_SUBSCRIPTION_PLAN_NOT_FOUND(404, "Không tìm thấy gói đăng ký mặc định", HttpStatus.NOT_FOUND),
    FARM_ROLE_NOT_FOUND(404, "Không tìm thấy vai trò trong trang trại", HttpStatus.NOT_FOUND),
    CROP_TYPE_NOT_FOUND(404,"Không tìm thấy loại cây trồng" , HttpStatus.NOT_FOUND),
    CROP_NOT_FOUND(404, "Không tìm thấy cây trồng" , HttpStatus.NOT_FOUND ),
    PLOT_NOT_FOUND(404,"Không tìm thấy lô đất" , HttpStatus.NOT_FOUND),


    // --- Payment conflict ---
    PAYMENT_ALREADY_PROCESSED(409, "Payment already processed", HttpStatus.CONFLICT),
    PAYMENT_EXPIRED(410, "Payment link has expired", HttpStatus.GONE),               // 410 → GONE
    PAYMENT_AMOUNT_MISMATCH(422, "Payment amount does not match", HttpStatus.UNPROCESSABLE_ENTITY), // 422 → UNPROCESSABLE_ENTITY

    // --- Existed ---
    PLOT_ALREADY_EXISTS(409, "Tên lô đất đã tồn tại", HttpStatus.CONFLICT),
    CROP_ALREADY_EXISTS(409, "Tên cây trồng đã tồn tại", HttpStatus.CONFLICT),
    CROP_TYPE_ALREADY_EXISTS(409, "Tên loại cây trồng đã tồn tại", HttpStatus.CONFLICT),
    PLAN_ALREADY_EXISTS(409,"Tên kế hoạch đã tồn tại", HttpStatus.CONFLICT),
    FARM_ALREADY_EXISTS(409, "Tên trang trại đã tồn tại", HttpStatus.CONFLICT),
    CROP_TYPE_IN_USE(409, "Loại cây trồng đang được sử dụng" ,HttpStatus.CONFLICT ),
    PLAN_STAGE_ALREADY_EXISTS(409,"Tên giai đoạn đã tồn tại", HttpStatus.CONFLICT),

    // --- Invalid ---
    INVALID_DATE_RANGE(400, "Thời gian bắt đầu phải trước thời gian kết thúc" , HttpStatus.BAD_REQUEST ),
    INVALID_DATE_NOW(400,"Thời gian kết thúc không được ở quá khứ", HttpStatus.BAD_REQUEST ),


    ;
    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}