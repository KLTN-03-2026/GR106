# Báo cáo tích hợp API (Cập nhật 13/04/2026)

Dự án đã tích hợp thành công các API cốt lõi. Dưới đây là danh sách chi tiết các endpoint đã được triển khai, xác thực và đồng bộ với hệ thống validation (Zod).

---

## 1. Auth Controller (Xác thực & Bảo mật)
Quản lý danh tính người dùng và bảo mật phiên làm việc.
- **Service file**: `src/services/authService.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Data Payload |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/register` | Đăng ký tài khoản | `email, password, fullName` |
| POST | `/api/v1/auth/login` | Đăng nhập hệ thống | `email, password` |
| POST | `/api/v1/auth/verify` | Xác thực tài khoản (OTP/Token) | `token` |
| POST | `/api/v1/auth/refresh` | Làm mới Token (Silent Refresh) | `refreshToken` |
| POST | `/api/v1/auth/forgot-password`| Yêu cầu khôi phục mật khẩu | `email` |
| POST | `/api/v1/auth/reset-password` | Đặt lại mật khẩu mới | `token, newPassword` |
| POST | `/api/v1/auth/change-password`| Đổi mật khẩu trong Profile | `oldPassword, newPassword` |

---

## 2. Farm API (Quản lý Trang trại - Multi-tenant)
Hệ thống hỗ trợ làm việc với nhiều trang trại đồng thời.
- **Service/Store**: `src/services/farmService.ts`, `src/store/farmSlice.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/farms` | Danh sách farm sở hữu | Trả về thông tin đầy đủ |
| POST | `/api/v1/farms` | Tạo trang trại mới | Payload: `farmName, description` |
| GET | `/api/v1/farms/{id}` | Lấy chi tiết 1 trang trại | Dùng cho trang Cài đặt Farm |
| GET | `/api/v1/farms/summary` | Tóm tắt danh sách Farm | Dùng cho Sidebar/Farm Switcher |
| POST | `/api/v1/farms/{id}/select` | **Chọn context làm việc** | Trả về **Farm Token** đặc thù cho Farm đó |

---

## 3. Plot API (Quản lý Lô đất)
Quản lý dữ liệu không gian và trạng thái canh tác.
- **Store file**: `src/store/plotSlice.ts`
- **Trạng thái**: Cơ bản (Đang cập nhật Update/Delete)

| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/plots` | Lấy danh sách lô đất | Trả về GeoJSON coordinates |
| POST | `/api/v1/plots` | Tạo lô đất mới | Cần `plotName, geometry, areaHa` |
| PATCH | `/api/v1/plots/{id}` | Cập nhật ranh giới/tên | *Placeholder (Chờ tích hợp UI Map)* |
| DELETE| `/api/v1/plots/{id}` | Xóa lô đất | *Placeholder* |

---

## 4. Subscription & Payment (Thanh toán Gói cước)
Tích hợp cổng SePay và quản lý đặc quyền tài khoản.
- **Services**: `src/services/subscription/`, `src/services/payment/`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/subscriptions` | Danh sách gói cước (Pricing) | Phân tầng Free/Basic/Pro/Enterprise |
| GET | `/api/v1/subscriptions/current` | Gói cước Active của Farm | Kiểm tra hạn dùng & hạn mức |
| GET | `/api/v1/subscriptions/history` | Lịch sử giao dịch | Danh sách các lần nâng cấp |
| POST | `/api/v1/payment/create` | Tạo lệnh thanh toán | Trả về Form SePay (OrderAmount, Sig...) |
| GET | `/api/v1/payments/result/{code}`| Kiểm tra kết quả thanh toán | Dùng để verify trạng thái đơn hàng |

---

## 5. External Services (Dịch vụ bên thứ 3)
Các tích hợp bổ trợ cho Dashboard.

- **Weather API**: Lấy dữ liệu thời tiết thời gian thực.
    - **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
    - **Method**: GET
    - **Params**: `lat, lon, appid, units=metric`

---

## 6. Luồng Multi-tenant & Security (Farm Token Flow)
Hệ thống sử dụng cơ chế bảo mật kép để đảm bảo cô lập dữ liệu:
1.  **User Authentication**: Đăng nhập lấy User JWT Token.
2.  **Context Selection**: Gọi `/select` để chuyển đổi context sang một Farm cụ thể.
3.  **Farm Token Usage**: Mọi request sau đó (Plots, Members, Map) PHẢI đính kèm Farm Token.
4.  **Auto-Context**: Redux store và URL params được ưu tiên để tự động chọn đúng Farm context khi reload trang.

> [!IMPORTANT]
> Toàn bộ logic API đều đi qua `axiosInstance` với cơ chế **Auto-Refresh Token** khi access token hết hạn mà không làm gián đoạn trải nghiệm người dùng.
