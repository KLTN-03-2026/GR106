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
    PLAN_NOT_FOUND(404,"Không tìm thấy kế hoạch", HttpStatus.NOT_FOUND),
    CROP_NOT_FOUND(404, "Không tìm thấy cây trồng" , HttpStatus.NOT_FOUND ),
    PLOT_NOT_FOUND(404,"Không tìm thấy lô đất" , HttpStatus.NOT_FOUND),
    PLAN_STAGE_STATUS_INITIAL_NOT_FOUND(404, "Không tìm thấy trạng thái khởi tạo ban đầu", HttpStatus.NOT_FOUND),
    TASK_STATUS_INITIAL_NOT_FOUND(404, "Không tìm thấy trạng thái khởi tạo ban đầu", HttpStatus.NOT_FOUND),
    PLAN_STAGE_NOT_FOUND(404, "Không tìm thấy giai đoạn của kế hoạch", HttpStatus.NOT_FOUND),
    TASK_NOT_FOUND(404,"Không tìm thấy công việc" ,HttpStatus.NOT_FOUND ),
    WAREHOUSE_NOT_FOUND(404, "Không tìm thấy kho", HttpStatus.NOT_FOUND),
    WAREHOUSE_ITEM_NOT_FOUND(404, "Không tìm thấy vật tư", HttpStatus.NOT_FOUND),

    // --- Payment conflict ---
    PAYMENT_ALREADY_PROCESSED(409, "Payment already processed", HttpStatus.CONFLICT),
    PAYMENT_EXPIRED(410, "Payment link has expired", HttpStatus.GONE),               // 410 → GONE
    PAYMENT_AMOUNT_MISMATCH(422, "Payment amount does not match", HttpStatus.UNPROCESSABLE_ENTITY), // 422 → UNPROCESSABLE_ENTITY

    // --- Existed ---
    PLOT_ALREADY_EXISTS(409, "Tên lô đất đã tồn tại", HttpStatus.CONFLICT),

    CROP_ALREADY_EXISTS(409, "Tên cây trồng đã tồn tại", HttpStatus.CONFLICT),
    CROP_TYPE_ALREADY_EXISTS(409, "Tên loại cây trồng đã tồn tại", HttpStatus.CONFLICT),

    PLAN_ALREADY_EXISTS(409,"Tên kế hoạch đã tồn tại", HttpStatus.CONFLICT),
    PLOT_ALREADY_IN_PLAN(409, "Lô đất này đã ở trong kế hoạch",  HttpStatus.CONFLICT),
    FARM_ALREADY_EXISTS(409, "Tên trang trại đã tồn tại", HttpStatus.CONFLICT),

    CROP_TYPE_IN_USE(409, "Loại cây trồng đang được sử dụng" ,HttpStatus.CONFLICT ),

    PLAN_STAGE_ALREADY_EXISTS(409,"Tên giai đoạn đã tồn tại", HttpStatus.CONFLICT),
    PLAN_STAGE_OVERLAP(409,"Thời gian bị trùng với giai đoạn khác" , HttpStatus.CONFLICT ),

    WAREHOUSE_ALREADY_EXISTS(409, "Tên kho đã tồn tại", HttpStatus.CONFLICT),

    // --- Invalid ---
    INVALID_DATE_RANGE(400, "Thời gian bắt đầu phải trước thời gian kết thúc" , HttpStatus.BAD_REQUEST ),
    INVALID_DATE_NOW(400,"Thời gian kết thúc không được ở quá khứ", HttpStatus.BAD_REQUEST ),
    TASK_OUT_OF_TIME_PLAN_STAGE(400,"Thơi gian công việc phải nằm trong thời gian giai đoạn" ,HttpStatus.BAD_REQUEST ),
    PLAN_TIME_CANNOT_LESS_STAGE(409, "Thời gian kế hoạch phải bao phủ toàn bộ giai đoạn", HttpStatus.CONFLICT),
    PLAN_STAGE_TIME_MUST_BE_IN_PLAN_TIME(409, "Thời gian giai đoạn phải nằm trong thời gian kế hoạch", HttpStatus.CONFLICT),
    FARM_MEMBER_ALREADY_EXISTS(409,"Thành viên đã tồn tại trong trang trại" ,HttpStatus.CONFLICT ),
    PAYMENT_NOT_FOUND(404,"Không tìm thấy giao dịch" ,HttpStatus.NOT_FOUND ),
    YOU_HAVE_NOT_ANY_INVITATION(404,"Bạn không có bất kỳ lời mời vào trang trại nào" ,HttpStatus.NOT_FOUND ),
    PLAN_STAGE_NOT_COVER_TASK(409, "Thời gian giai đoạn không bao phủ được công việc", HttpStatus.CONFLICT),

    INVITATION_ALREADY_SENT(409,"Bạn đã mời người dùng này" , HttpStatus.CONFLICT),
    INVITATION_NOT_FOUND(404,"Không tìm thấy lời mời" ,HttpStatus.NOT_FOUND ),
    INVITATION_ALREADY_USED(409, "Lời mời đã được sử dụng", HttpStatus.CONFLICT),
    INVITATION_EXPIRED(409, "Lời mời đã hết hạn", HttpStatus.CONFLICT),

    CANNOT_INVITE_YOURSELF(409,"Bạn không thể tự mời chính mình" ,HttpStatus.CONFLICT ),
    CANNOT_REMOVE_OWNER(409,"Không thể xoá chủ trang trại" ,HttpStatus.CONFLICT ),
    FARM_MEMBER_NOT_FOUND(404,"Không tìm thấy thành viên",HttpStatus.NOT_FOUND),
    CANNOT_REMOVE_YOURSELF(409,"Bạn không thể tự xoá chính mình" ,HttpStatus.CONFLICT ),
    SKU_ALREADY_EXISTS(409,"Mã hàng đã tồn tại" ,HttpStatus.CONFLICT ),
    SUPPLIER_ALREADY_EXISTS(409,"Mã nhà cung cấp đã tồn tại" ,HttpStatus.CONFLICT ),
    SKU_IS_USING(409,"Mã hàng đang được sử dụng" ,HttpStatus.CONFLICT ),

    SUPPLIER_IS_USING(409,"Mã hàng đang được sử dụng" ,HttpStatus.CONFLICT ), WAREHOUSE_ITEM_ALREADY_EXISTS(409,"Tên vật tư đã tồn tai" ,HttpStatus.CONFLICT ),
    UNIT_NOT_FOUND(404,"Không tìm thấy đơn vị" ,HttpStatus.NOT_FOUND ),
    SUPPLIER_NOT_FOUND(404,"Không tìm thấy nhà cung cấp" ,HttpStatus.NOT_FOUND ),
    SKU_NOT_FOUND(404,"Không tìm thấy mã vật tư" , HttpStatus.NOT_FOUND),
    TASK_IS_TERMINAL(409,"Công việc đã kết thúc" ,HttpStatus.CONFLICT ),
    TASK_MATERIAL_ALREADY_EXISTS(409, "Vật tư này đã được thêm vào task, vui lòng cập nhật số lượng thay vì thêm mới",  HttpStatus.CONFLICT ),
    INSUFFICIENT_STOCK_FOR_PLAN(409, "Số lượng tồn kho không đủ cho kế hoạch", HttpStatus.CONFLICT),


    WAREHOUSE_LOCATION_ALREADY_EXISTS(409,"Vị trí trong kho đã tồn tại" ,HttpStatus.CONFLICT ),
    WAREHOUSE_LOCATION_NOT_FOUND(404,"Vị trí này không tồn tại trong kho" ,HttpStatus.NOT_FOUND ),
    TASK_ASSIGNEE_ALREADY_USER(409,"Người này đã được gán vào công việc" ,HttpStatus.CONFLICT ),
    TASK_STATUS_NOT_FOUND(404,"Không tìm thấy trạng thái công việc" ,HttpStatus.NOT_FOUND ),
    TASK_STATUS_TRANSITION_NOT_FOUND(404,"Không tìm thấy chuyển đổi giữa 2 trạng thái của công việc" ,HttpStatus.NOT_FOUND ),
    PLAN_STAGE_STATUS_NOT_FOUND(404,"Không tìm thấy trạng thái giai đoạn" ,HttpStatus.NOT_FOUND ),
    PLAN_STAGE_STATUS_TRANSITION_NOT_FOUND(404,"Không tìm thấy chuyển đổi giữa 2 trạng thái của giai đoạn" ,HttpStatus.NOT_FOUND );



    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}