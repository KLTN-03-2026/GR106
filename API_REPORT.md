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
- **Service file**: `src/services/farmService.ts`, `src/store/farmSlice.ts`
- **Các Endpoint**:
    - `POST /api/v1/farms`: Tạo trang trại mới.
    - `GET /api/v1/farms`: Lấy toàn bộ danh sách trang trại mà người dùng đang sở hữu.
    - `GET /api/v1/farms/summary`: Lấy thông tin tổng quan các farm (farmId, farmName, myRole, owner...).
    - `GET /api/v1/farms/{id}`: Lấy thông tin chi tiết một trang trại cụ thể.
    - `POST /api/v1/farms/{id}/select`: Chọn trang trại để làm việc và nhận `farmToken`.

## 3. Quản lý Gói cước & Thanh toán
Xử lý các dịch vụ đăng ký gói và thanh toán qua cổng SePay.

### Subscription API
- **Service file**: `src/services/subscription/getSubscriptionPlanService.ts`
- **Endpoints**:
    - `GET /api/v1/subscriptions`: Lấy danh sách các gói dịch vụ (FREE, BASIC, PRO, ...).
        - **Status**: ✅ Integrated (Hiển thị tại màn hình Pricing/Upgrade).
    - `GET /api/v1/subscriptions/current`: Lấy thông tin gói subscription đang active của trang trại.
        - **Status**: ✅ Integrated (Hiển thị tại Dashboard Sidebar & Hub Subscription).
    - `GET /api/v1/subscriptions/history`: Lấy toàn bộ lịch sử đăng ký gói của farm hiện tại.
        - **Status**: ✅ Integrated (Hiển thị tại bảng Lịch sử trong Hub Subscription).

### Payment API (SePay)
- **Service files**: `src/services/payment/createPaymentService.ts`, `src/services/payment/getPaymentResultService.ts`
- **Endpoints**:
    - `POST /api/v1/payment/create`: Tạo link thanh toán SePay. FE nhận paymentUrl từ API và redirect người dùng.
        - **Status**: ✅ Integrated (Kích hoạt khi người dùng nhấn thanh toán gói cước).
    - `POST /api/v1/payment/ipn`: IPN callback từ SePay (Server-to-server). Không yêu cầu JWT.
        - **Status**: ⚠️ Server Side Only (FE không gọi trực tiếp API này).
    - `GET /api/v1/payments/result/{orderCode}`: Kiểm tra và nhận kết quả thanh toán từ hệ thống.
        - **Status**: ✅ Integrated (Sử dụng tại màn hình kết quả thanh toán - `PaymentResultPage.tsx`).

## 4. Dịch vụ Thời tiết (External API)
Tích hợp dữ liệu thời tiết thực tế từ bên thứ ba.
- **Service file**: `src/services/weatherService.ts`
- **Endpoint**: 
    - `GET https://api.openweathermap.org/data/2.5/weather`: Lấy thông tin thời tiết dựa trên tọa độ (lat, lon).

## 5. Quản lý Lô đất (Plots)
Quản lý các khu vực canh tác bên trong một trang trại.
- **Store file**: `src/store/plotSlice.ts`
- **Các Endpoint**:
    - `GET /api/v1/plots`: Lấy danh sách toàn bộ lô đất trong hệ thống.
        - **Status**: ✅ Integrated (Hiển thị tại màn hình LandPlotsPage).
    - `POST /api/v1/plots`: Tạo một lô đất mới thuộc farm hiện tại với thông tin tên, mô tả và tọa độ GeoJSON.
        - **Status**: ✅ Integrated (Sử dụng tại CreatePlotModal).

---
## 6. Luồng xử lý Hệ thống (System Flow)

### Luồng Thanh toán & Nâng cấp (Subscription Flow)
Để đảm bảo tính nhất quán của dữ liệu khi nâng cấp gói cước cho đúng trang trại, hệ thống tuân thủ luồng sau:
1. **Truy cập Gói cước**: Người dùng từ 'Quản lý Gói dịch vụ' (`/subscription`) nhấn 'Nâng cấp'.
2. **Chọn Gói**: Tại trang Pricing (`/subscription/pricing`), người dùng chọn gói cước mong muốn.
3. **Xác nhận Trang trại (Farm Context)**: 
   - Khi nhấn 'Thanh toán', nếu chưa có trang trại nào được chọn (`currentFarmId` null) hoặc chưa xác nhận lại trong phiên làm việc, hệ thống sẽ hiển thị **Modal chọn trang trại**.
   - Sau khi chọn, hệ thống gọi `selectFarm(farmId)` để lấy `farmToken` và thiết lập `currentFarmId`.
4. **Thanh toán SePay**: Hệ thống gửi yêu cầu tạo giao dịch và chuyển hướng người dùng sang cổng **SePay**.

### Cơ chế Quản lý Ngữ cảnh (Context Cleaning)
Để tránh việc người dùng bị "kẹt" trong một ngữ cảnh trang trại sau khi kết thúc hoặc hủy luồng thanh toán:
- **Thoát luồng**: Khi người dùng nhấn vào menu 'Trang trại' (`/farms`) trên Sidebar để thoát khỏi trang thanh toán/nâng cấp, hệ thống sẽ tự động kích hoạt action `clearFarmContext()`.
- **Kết quả**: `currentFarmId` bị xóa khỏi Redux và LocalStorage, `accessToken` được khôi phục về `userToken` gốc. Điều này cho phép người dùng quay lại trạng thái "Hub" để quản lý toàn bộ danh sách trang trại một cách sạch sẽ.

---
**Ghi chú**: Tất cả các API nội bộ (Backend) đều sử dụng `axiosInstance` được cấu hình tại `src/config/axios.ts` để tự động đính kèm `Authorization` token vào Header của request.
