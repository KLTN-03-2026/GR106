# Báo cáo Đồng bộ hóa hệ thống API (API Synchronization Report)
*Ngày cập nhật: 04/05/2026*

Dưới đây là danh sách toàn bộ các API đã được đồng bộ hóa giữa Frontend và Backend dựa trên tài liệu Swagger mới nhất. Tất cả các service đã được kiểm tra tính nhất quán về Endpoint, Method, Request Body và Response Schema.

---

## 1. Hệ thống Xác thực (Auth API)
**Service:** `src/services/auth/authService.ts`

- `POST /api/v1/auth/login`: Đăng nhập hệ thống.
- `POST /api/v1/auth/register`: Đăng ký tài khoản mới.
- `POST /api/v1/auth/refresh`: Làm mới Access Token.
- `POST /api/v1/auth/verify`: Xác thực email/tài khoản.
- `POST /api/v1/auth/register/resend-mail`: Gửi lại email xác nhận.

## 2. Quản lý Kho bãi & Vị trí (Warehouse API)
**Service:** `src/services/warehouse/warehouseService.ts`

- `GET /api/v1/farms/{farmId}/warehouses`: Lấy danh sách kho.
- `POST /api/v1/farms/{farmId}/warehouses`: Tạo kho mới.
- `DELETE /api/v1/farms/{farmId}/warehouses/{warehouseId}`: Xóa kho (kèm version).
- `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/locations`: Lấy danh sách vị trí lưu kho.
- `POST /api/v1/farms/{farmId}/warehouses/{warehouseId}/locations`: Tạo vị trí mới.
- `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/locations/{locationId}`: Chi tiết vị trí lưu kho.

## 3. Quản lý Vật tư kho (Warehouse Item API)
**Service:** `src/services/warehouseItem/warehouseItemService.ts`

- `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/items`: Danh sách vật tư theo kho.
- `POST /api/v1/farms/{farmId}/warehouses/{warehouseId}/items`: Thêm vật tư vào kho.
- `PATCH /api/v1/farms/{farmId}/warehouses/{warehouseId}/items/{itemId}`: Cập nhật vật tư.
- `DELETE /api/v1/farms/{farmId}/warehouses/{warehouseId}/items/{itemId}`: Xóa vật tư khỏi kho.
- `GET /api/v1/farms/{farmId}/warehouses/items`: Danh sách vật tư toàn Farm.
- `DELETE /api/v1/farms/{farmId}/items/{itemId}`: Xóa vật tư khỏi hệ thống Farm.

## 4. Quản lý Cây trồng (Crop API)
**Service:** `src/services/crop/cropService.ts`

- `GET /api/v1/crops`: Danh sách cây trồng hệ thống (SYSTEM).
- `GET /api/v1/farms/{farmId}/crops`: Danh sách cây trồng của Farm.
- `GET /api/v1/crops/{cropId}`: Chi tiết cây trồng.
- `POST /api/v1/crop-types`: Tạo loại cây trồng (Admin).

## 5. Kế hoạch sản xuất (Season Plan API)
**Service:** `src/services/seasonplan/seasonPlanService.ts`

- `GET /api/v1/plans`: Danh sách kế hoạch.
- `POST /api/v1/plans`: Tạo kế hoạch mới.
- `GET /api/v1/plans/{planId}`: Chi tiết kế hoạch.
- `PUT /api/v1/plans/{planId}/time`: Cập nhật thời gian kế hoạch.

## 6. Giai đoạn kế hoạch (Plan Stage API)
**Service:** `src/services/seasonplan/seasonPlanPhaseService.ts`

- `GET /api/v1/plans/{planId}/stages`: Danh sách giai đoạn.
- `POST /api/v1/plans/{planId}/stages`: Tạo giai đoạn mới.
- `GET /api/v1/plans/{planId}/stages/{stageId}`: Chi tiết giai đoạn.
- `PATCH /api/v1/plans/{planId}/stages/{stageId}`: Cập nhật thông tin giai đoạn.
- `PUT /api/v1/plans/{planId}/stages/{stageId}/time`: Cập nhật thời gian giai đoạn.
- `DELETE /api/v1/plans/{planId}/stages/{stageId}`: Xóa giai đoạn.

## 7. Quản lý Công việc (Task API)
**Service:** `src/services/seasonplan/seasonPlanTaskService.ts`

- `GET /api/v1/plans/{planId}/stages/{stageId}/tasks`: Danh sách công việc.
- `POST /api/v1/plans/{planId}/stages/{stageId}/tasks`: Tạo công việc mới.
- `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}`: Chi tiết công việc.
- `PATCH /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}`: Cập nhật công việc.
- `PUT /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/time`: Cập nhật thời gian công việc.
- `DELETE /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}`: Xóa công việc.

## 8. Quan hệ phụ thuộc Task (Task Dependency API)
**Service:** `src/services/seasonplan/seasonPlanTaskService.ts`

- `GET /api/v1/tasks/{taskId}/dependencies`: Danh sách Task phụ thuộc (mô hình Envelope).
- `POST /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/dependencies`: Tạo quan hệ phụ thuộc.
- `DELETE /api/v1/tasks/{taskId}/dependencies/{dependsOnTaskId}`: Xóa quan hệ phụ thuộc.

## 9. Vật tư gắn với Task (Task Material API)
**Service:** `src/services/seasonplan/taskMaterialService.ts`

- `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials`: Danh sách vật tư của Task.
- `POST /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials`: Thêm vật tư cho Task.
- `DELETE /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials/{materialId}`: Xóa vật tư khỏi Task.

## 10. Trạng thái công việc (Task Status API)
**Service:** `src/services/seasonplan/taskStatusService.ts`

- `GET /api/v1/task-statuses`: Danh sách tất cả trạng thái Task.
- `GET /api/v1/task-status-transitions`: Luồng chuyển đổi trạng thái hợp lệ.
- `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/available-statuses`: Trạng thái kế tiếp khả dụng.
- `PUT /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/status/{statusId}`: Cập nhật trạng thái Task.
- `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/status-histories`: Lịch sử thay đổi trạng thái.

## 11. Thành viên & Lời mời (Farm Invitation & Member API)
**Service:** `src/services/members/memberService.ts`

- `GET /api/v1/farms/{farmId}/members`: Danh sách thành viên Farm.
- `POST /api/v1/farms/{farmId}/members`: Mời thành viên mới.
- `DELETE /api/v1/farms/{farmId}/members/{memberId}`: Xóa thành viên khỏi Farm.
- `GET /api/v1/farms/roles`: Danh sách vai trò (Roles) trong Farm.
- `GET /api/v1/invitations/me`: Danh sách lời mời của cá nhân.
- `POST /api/v1/invitations/{invitationId}/accept`: Chấp nhận lời mời tham gia Farm.
- `GET /api/v1/invitations/{invitationId}/preview`: Xem trước thông tin lời mời.
- `PATCH /api/v1/farms/{farmId}/invitations/{invitationId}/cancel`: Hủy lời mời đã gửi.
- `GET /api/v1/farms/{farmId}/invitations/{invitationId}`: Xem chi tiết lời mời cụ thể.

## 12. Nhà cung cấp (Supplier API)
**Service:** `src/services/supplier/supplierService.ts`

- `GET /api/v1/farms/{farmId}/suppliers`: Danh sách nhà cung cấp.
- `POST /api/v1/farms/{farmId}/suppliers`: Tạo nhà cung cấp mới.
- `DELETE /api/v1/farms/{farmId}/suppliers/{supplierId}`: Xóa nhà cung cấp.

## 13. Danh mục SKU & Đơn vị tính (SKU & Unit API)
**Services:** `src/services/sku/skuService.ts`, `src/services/unit/unitService.ts`

- `GET /api/v1/farms/{farmId}/skus`: Danh sách SKU của Farm.
- `POST /api/v1/farms/{farmId}/skus`: Tạo SKU mới.
- `DELETE /api/v1/farms/{farmId}/skus/{sku}`: Xóa SKU theo mã.
- `GET /api/v1/units`: Danh sách đơn vị tính hệ thống.

## 14. Quản lý Lô đất (Plot API)
**Service:** `src/services/plots/plotService.ts`

- `GET /api/v1/plots`: Lấy danh sách lô đất của farm hiện tại.
- `POST /api/v1/plots`: Tạo lô đất mới.
- `PATCH /api/v1/plots/{plotId}`: Cập nhật thông tin lô đất (kèm version).
- `DELETE /api/v1/plots/{plotId}`: Xóa lô đất.

## 15. Quản lý Trang trại (Farm API)
**Service:** `src/services/farm/farmService.ts`

- `GET /api/v1/farms`: Lấy danh sách farm mà user sở hữu.
- `POST /api/v1/farms`: Tạo farm mới.
- `POST /api/v1/farms/{farmId}/select`: Chọn farm làm việc (Cấp Farm Token).
- `GET /api/v1/farms/{farmId}`: Lấy chi tiết thông tin một farm.
- `PATCH /api/v1/farms/{farmId}`: Cập nhật thông tin farm (kèm version).
- `DELETE /api/v1/farms/{farmId}`: Xóa farm.
- `GET /api/v1/farms/summary`: Lấy thông tin tổng quan farm (Dashboard).

---
**Ghi chú:** Tất cả các API trên đều tuân thủ cấu trúc phản hồi chuẩn `{ success, code, message, data, timestamp }`.
