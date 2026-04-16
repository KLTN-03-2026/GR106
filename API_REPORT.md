# Báo cáo Tài liệu & Luồng xử lý API (FarmerAI)

**Cập nhật lần cuối**: 15/04/2026
**Trạng thái**: Đồng bộ 100% với đặc tả Backend (Farm, Plot, Payment, Member, Subscription, Crop)

Dự án FarmerAI được xây dựng trên kiến trúc **Multi-tenant**, đảm bảo tính cô lập dữ liệu giữa các trang trại và tính bảo mật cao thông qua cơ chế quản lý Token kép (User Token & Farm Token).

---

## Chương 1: Kiến trúc & Cơ chế xử lý API

### 1.1. Cơ chế Multi-tenant Token (Context Switch)
Hệ thống sử dụng cơ chế chuyển đổi ngữ cảnh để đảm bảo an toàn dữ liệu:
1.  **User Token**: Nhận được sau khi đăng nhập. Sử dụng cho các API chung (Profile, Farm List).
2.  **Farm Token**: Nhận được sau khi gọi `/api/v1/farms/{id}/select`. Token này chứa `farmId` và vai trò của user trong farm đó. Mọi API thuộc Scope **FARM** (Plot, Member,...) bắt buộc phải sử dụng token này.

### 1.2. Tầng Client API & Validation
- **Axios Instance**: Quản lý tập trung tại `src/config/axios.ts` với Silent Refresh (401 handler).
- **Zod Schema**: Đảm bảo dữ liệu đầu vào (Request) và đầu ra (Response) luôn khớp 100% với định dạng mong đợi.

---

## Chương 2: Danh mục API chi tiết (Endpoint Specification)

### 2.1. Module Trang trại (Farm API - Multi-tenant)
Hành động dành cho chủ sở hữu trang trại.

| Method | Endpoint | Mô tả | Quyền hạn |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/farms` | Lấy danh sách farm user đang sở hữu | User |
| POST | `/api/v1/farms` | Tạo farm mới (Payload: `farmName, description`) | User |
| POST | `/api/v1/farms/{id}/select` | **Chọn farm & Nhận Farm Token** | User |
| GET | `/api/v1/farms/summary` | Lấy thông tin tóm tắt dashboard | User |

### 2.2. Module Lô đất & Bản đồ (Plot API)
Quản lý lô đất trực thuộc Farm hiện tại (Yêu cầu Farm Token).

| Method | Endpoint | Mô tả | Payload Đặc trưng |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/plots` | Lấy danh sách lô đất trong farm | - |
| POST | `/api/v1/plots` | Tạo lô đất mới | `plotName, geometry, description` |
| DELETE | `/api/v1/plots/{plotId}` | Xóa lô đất khỏi farm | - |
| PATCH | `/api/v1/plots/{plotId}` | Cập nhật lô đất (Partial update) | `name, status, geometry, description` |

### 2.3. Module Thành viên (Member API)
Quản lý nhân sự trong trang trại (Yêu cầu Farm Token).

| Method | Endpoint | Mô tả | Quyền hạn |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/farms/{id}/members` | Danh sách thành viên farm | Manager+ |
| POST | `/api/v1/farms/{id}/members/invite` | Mời thành viên mới | Owner |
| PATCH | `/api/v1/farms/{id}/members/{uId}/role` | Đổi vai trò thành viên | Owner |
| DELETE | `/api/v1/farms/{id}/members/{uId}` | Xóa thành viên khỏi farm | Owner |

### 2.4. Module Gói dịch vụ (Subscription API)
Quản lý trạng thái và lịch sử đăng ký.

| Method | Endpoint | Mô tả | 
| :--- | :--- | :--- |
| GET | `/api/v1/subscriptions` | Danh sách các gói cước hệ thống |
| GET | `/api/v1/subscriptions/current` | Thông tin gói đang sử dụng của farm |
| GET | `/api/v1/subscriptions/history` | Lịch sử giao dịch/đăng ký |

### 2.5. Module Thanh toán (Payment API - SePay)
Tích hợp thanh toán Subscription.

| Method | Endpoint | Mô tả | Lưu ý |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/payment/create` | Tạo link thanh toán SePay | Nhận `paymentUrl` để redirect |
| POST | `/api/v1/payment/ipn` | Callback từ SePay (Server-to-Server) | **Không yêu cầu JWT** |

### 2.6. Module Danh mục Cây trồng (Crop Catalog API)
Quản lý cây trồng hệ thống.

| Method | Endpoint | Mô tả | Quyền hạn |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/crops` | Danh sách cây trồng hệ thống | Public |
| POST | `/api/v1/crops` | Tạo cây trồng mới | Admin |
| GET | `/api/v1/crop-types` | Danh mục loại cây | Public |
| POST | `/api/v1/crop-type` | Tạo loại cây mới | Admin |
| DELETE | `/api/v1/crop-type/{id}` | Xóa loại cây | Admin |

---

## Chương 3: Chi tiết Payload & Phản hồi chuẩn

### 3.1. Cấu trúc Response (Standard JSON)
```json
{
  "success": true,
  "code": 0,
  "message": "Thao tác thành công",
  "data": { ... },
  "timestamp": "2026-04-15T09:12:32Z"
}
```

### 3.2. Payload IPN SePay (Ví dụ)
```json
{
  "timestamp": 1713172352,
  "notification_type": "transaction_status_changed",
  "order": {
    "order_id": "SUB-12345",
    "order_status": "PAID",
    "order_amount": 150000
  },
  "transaction": {
    "transaction_id": "SEPAY-999",
    "payment_method": "BANK_TRANSFER"
  }
}
```

---

## Chương 4: Luồng xử lý nghiệp vụ chính

### 4.1. Chuyển đổi Farm Context
1. User đăng nhập -> Nhận `UserToken`.
2. Gọi `/api/v1/farms/{id}/select`.
3. Nhận `FarmToken` -> Lưu vào Cookie/LocalStorage.
4. Axios Interceptor tự động chọn `FarmToken` nếu khả dụng.

### 4.2. Vẽ & Lưu Lô đất (GIS Workflow)
1. User vẽ Polygon trên Map (Leaflet/Mapbox).
2. Frontend chuyển tọa độ sang chuẩn **GeoJSON**.
3. Gọi `POST /api/v1/plots`.

---
** FarmerAI Technical Report - Documented by AGENT **
