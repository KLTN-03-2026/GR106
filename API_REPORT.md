# Báo cáo các API đang sử dụng trong dự án

Tài liệu này tổng hợp danh sách các API thực tế đang được tích hợp và sử dụng trong mã nguồn của frontend.

## 1. Hệ thống xác thực (Authentication)
Dịch vụ quản lý người dùng và phiên làm việc.
- **Service file**: `src/services/authService.ts`
- **Các Endpoint**:
    - `POST /api/v1/auth/register`: Đăng ký tài khoản mới.
    - `POST /api/v1/auth/login`: Đăng nhập, nhận Token và thông tin User.
    - `POST /api/v1/auth/verify`: Xác thực email thông qua token.
    - `POST /api/v1/auth/refresh`: Làm mới Access Token khi hết hạn.
    - `POST /api/v1/auth/forgot-password`: Yêu cầu gửi email khôi phục mật khẩu (Placeholder).
    - `POST /api/v1/auth/reset-password`: Đặt lại mật khẩu mới (Placeholder).
    - `POST /api/v1/auth/change-password`: Đổi mật khẩu (Placeholder).

## 2. Quản lý Trang trại (Farm Management)
Quản lý danh sách và thông tin chi tiết các nông trại.
- **Service file**: `src/services/farmService.ts`
- **Các Endpoint**:
    - `POST /api/v1/farms`: Tạo trang trại mới.
    - `GET /api/v1/farms/my-farms`: Lấy danh sách các trang trại sở hữu bởi người dùng hiện tại.
    - `GET /api/v1/farms/{id}`: Lấy thông tin chi tiết một trang trại cụ thể.
    - `POST /api/v1/farms/{id}/select`: Chọn trang trại để làm việc và nhận `farmToken`.

## 3. Quản lý Gói cước & Thanh toán
Xử lý các dịch vụ đăng ký gói và thanh toán qua cổng VNPay/Momo.

### Subscription Hub
- **Service file**: `src/services/subscription/getSubscriptionPlanService.ts`
- **Endpoints**:
    - `GET /api/v1/subscriptions`: Lấy danh sách các gói cước dịch vụ hiện có.
        - **Status**: ✅ Integrated (Hiển thị tại màn hình Pricing/Upgrade).
    - `GET /api/v1/subscriptions/current`: Lấy thông tin gói dịch vụ đang hoạt động của trang trại.
        - **Status**: ✅ Integrated (Hiển thị tại Dashboard Sidebar & Hub Subscription).
    - `GET /api/v1/subscriptions/history`: Lấy toàn bộ lịch sử đăng ký gói của trang trại.
        - **Status**: ✅ Integrated (Hiển thị tại bảng Lịch sử trong Hub Subscription).

### Payment Services
- **Service files**: `src/services/payment/createPaymentService.ts`, `src/services/payment/getPaymentResultService.ts`
- **Endpoints**:
    - `POST /api/v1/payment/create`: Khởi tạo giao dịch thanh toán (VNPay/Momo).
        - **Status**: ✅ Integrated (Kích hoạt khi người dùng nhấn thanh toán gói cước).
    - `GET /api/v1/payments/result/{orderCode}`: Kiểm tra và nhận kết quả thanh toán từ hệ thống.
        - **Status**: ✅ Integrated (Sử dụng tại màn hình kết quả thanh toán - `PaymentResultPage.tsx`).

## 4. Dịch vụ Thời tiết (External API)
Tích hợp dữ liệu thời tiết thực tế từ bên thứ ba.
- **Service file**: `src/services/weatherService.ts`
- **Endpoint**: 
    - `GET https://api.openweathermap.org/data/2.5/weather`: Lấy thông tin thời tiết dựa trên tọa độ (lat, lon).

## 5. Quản lý Lô đất (Plots)
Quản lý các khu vực canh tác bên trong một trang trại.
- **Service file**: Tích hợp trực tiếp trong `src/store/plotSlice.ts`
- **Các Endpoint**:
    - `GET /api/v1/plots`: Lấy danh sách toàn bộ lô đất của farm hiện tại.
        - **Status**: ✅ Integrated (Hiển thị tại màn hình LandPlotsPage).
    - `POST /api/v1/plots`: Tạo một lô đất mới với thông tin tên, mô tả và tọa độ GeoJSON.
        - **Status**: ✅ Integrated (Sử dụng tại CreatePlotModal).

---
**Ghi chú**: Tất cả các API nội bộ (Backend) đều sử dụng `axiosInstance` được cấu hình tại `src/config/axios.ts` để tự động đính kèm `Authorization` token vào Header của request.
