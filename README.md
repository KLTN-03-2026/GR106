# 🌾 KLTN-T6-2026 - Hệ thống Quản lý Trang trại Thông minh

Dự án Hệ thống Quản lý Trang trại (Smart Farm Management System) hỗ trợ người nông dân quản lý lô đất, kế hoạch sản xuất, và các hoạt động nông nghiệp một cách hiệu quả.

---

## 🚀 Công nghệ sử dụng

- **Frontend**: React (Vite), TypeScript, Tailwind CSS.
- **State Management**: Redux Toolkit.
- **API Client**: Axios (với interceptors xử lý token).
- **Validation**: Zod.
- **Icons**: Lucide React.
- **Maps**: Google Maps Platform.

---

## 🛠️ Hướng dẫn cài đặt

1.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```
2.  **Cấu hình biến môi trường**:
    Tạo file `.env` dựa trên `.env.example` (nếu có) hoặc điền các giá trị cần thiết.
3.  **Chạy dự án ở chế độ phát triển**:
    ```bash
    npm run dev
    ```
4.  **Xây dựng bản production**:
    ```bash
    npm run build
    ```

---

## 🔐 Cấu trúc Phân quyền & Token (Auth Architecture)

Dự án sử dụng cơ chế **Double Token Scoping** để đảm bảo tính bảo mật và phân quyền chính xác giữa cấp độ Hệ thống (Hub) và cấp độ Trang trại (Farm).

### 1. Phân loại Token
- **Hub Token (Access Token gốc)**: Nhận được khi đăng nhập thành công. Dùng để thực hiện các thao tác quản lý tài khoản, xem danh sách trang trại, tạo mới trang trại.
- **Farm Token**: Nhận được sau khi người dùng chọn một trang trại cụ thể thông qua API `/api/v1/farms/{id}/select`. 
  - Token này chứa các thông tin đặc thù về vai trò (Role) và quyền (Permissions) của người dùng **trong phạm vi trang trại đó**.
  - Khi có Farm Token, hệ thống sẽ tự động gán nó vào header `Authorization` cho mọi request tiếp theo.

### 2. Giải mã Token (Decode Logic)
Hệ thống sử dụng thư viện `jwt-decode` (xem tại `src/utils/jwt.ts`) để trích xuất thông tin người dùng:
- **`sub`**: User ID.
- **`roles` / `authorities`**: Danh sách vai trò thô từ backend.
- **`perms` / `permissions`**: Các quyền cụ thể (ví dụ: `farm:update`, `member:invite`).
- **Mapping Role**: Hệ thống tự động ánh xạ vai trò từ token sang các mức quyền trong ứng dụng:
  - `admin`, `owner`, `manager`, `employee`, `user`.

### 3. Quy trình chuyển đổi Context
- **Vào Farm**: `selectFarm` action sẽ lưu `farmToken` đè lên `accessToken` hiện tại.
- **Thoát Farm**: `clearFarmContext` action sẽ khôi phục `accessToken` từ `hubToken` để người dùng có thể quay lại quản lý danh sách trang trại chung.

---

## 📋 Danh sách API (Endpoints)

Dưới đây là tóm tắt các API chính đang được sử dụng trong dự án (Đồng bộ 100% với backend):

### 1. Auth API
- `POST /api/v1/auth/login`: Đăng nhập.
- `POST /api/v1/auth/register`: Đăng ký.
- `POST /api/v1/auth/refresh`: Làm mới token.
- `POST /api/v1/auth/verify`: Xác thực email.

### 2. Farm API
- `GET /api/v1/farms`: Danh sách trang trại của tôi.
- `POST /api/v1/farms`: Tạo trang trại mới.
- `POST /api/v1/farms/{id}/select`: **Quan trọng** - Chọn trang trại và lấy Farm Token.
- `PATCH /api/v1/farms/{id}`: Cập nhật thông tin trang trại.
- `GET /api/v1/farms/summary`: Dữ liệu tổng quan dashboard.

### 3. Plan & Stage API
- `GET /api/v1/plans`: Danh sách kế hoạch.
- `POST /api/v1/plans`: Tạo kế hoạch mới.
- `GET /api/v1/plans/{id}/stages`: Danh sách giai đoạn của kế hoạch.
- `PUT /api/v1/plans/{id}/time`: Cập nhật thời gian kế hoạch.

### 4. Plot API (Lô đất)
- `GET /api/v1/plots`: Danh sách lô đất.
- `POST /api/v1/plots`: Tạo lô đất mới (Kèm tọa độ Google Maps).
- `PATCH /api/v1/plots/{id}`: Cập nhật lô đất.
- `DELETE /api/v1/plots/{id}`: Xóa lô đất.

### 5. Quản lý Thành viên
- `GET /api/v1/farms/{id}/members`: Danh sách thành viên trong farm.
- `POST /api/v1/farms/{id}/invitations`: Gửi lời mời tham gia farm.

*(Chi tiết xem thêm tại file [API_REPORT.md](file:///c:/KLTN-T6-2026/API_REPORT.md))*

---

## 📝 Ghi chú Phát triển
- Luôn kiểm tra `farmToken` khi thực hiện các thao tác bên trong Dashboard.
- Các component sử dụng `useAuth` hook để lấy thông tin user và quyền hạn hiện tại.
- Mọi thay đổi API cần được cập nhật vào `API_REPORT.md` trước khi đẩy lên.
