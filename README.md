# KLTN-T6-2026 - Smart Farm Management System API Documentation

## 1. Plan Stage Status API
1. `PUT /api/v1/plans/{planId}/stages/{stageId}/status/{statusId}`: Cập nhật trạng thái Plan Stage (Cho phép cập nhật trạng thái của một giai đoạn kế hoạch).
2. `GET /api/v1/plans/{planId}/stages/{stageId}/status-histories`: Danh sách lịch sử trạng thái của Plan Stage (Trả về lịch sử thay đổi trạng thái của một giai đoạn kế hoạch).
3. `GET /api/v1/plans/{planId}/stages/{stageId}/available-statuses`: Danh sách trạng thái tiếp theo hợp lệ của Plan Stage.
4. `GET /api/v1/plan-stage-statuses`: Danh sách tất cả Plan Stage Status (Trả về toàn bộ danh sách trạng thái giai đoạn kế hoạch).
5. `GET /api/v1/plan-stage-status-transitions`: Danh sách transition trạng thái hợp lệ theo Farm hiện tại.

## 2. Farm API
6. `GET /api/v1/farms`: Lấy danh sách farm (Trả về toàn bộ farm mà user đang sở hữu hoặc tham gia).
7. `POST /api/v1/farms`: Tạo farm mới cho user hiện tại.
8. `POST /api/v1/farms/{farmId}/select`: Chọn farm để làm việc (Flow: Nhận Farm Token có chứa farmId + permissions để dùng cho các API tiếp theo).
9. `GET /api/v1/farms/{farmId}`: Lấy thông tin chi tiết một farm (Dành cho thành viên của farm).
10. `DELETE /api/v1/farms/{farmId}`: Xóa farm (Yêu cầu quyền chủ farm).
11. `PATCH /api/v1/farms/{farmId}`: Cập nhật thông tin farm (Chỉ chủ farm mới thực hiện được).
12. `GET /api/v1/farms/summary`: Lấy danh sách farm dạng summary (Dùng cho dashboard hiển thị nhanh).
13. `GET /api/v1/farms/roles`: Danh sách vai trò và quyền hạn trong hệ thống.

## 3. Warehouse Transaction API
14. `GET /api/v1/items/{warehouseItemId}/transactions`: Danh sách giao dịch theo Warehouse Item (Trả về lịch sử của một vật tư cụ thể).
15. `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/transactions`: Danh sách giao dịch theo Warehouse (Lịch sử giao dịch của một kho cụ thể).
16. `GET /api/v1/farms/{farmId}/transactions`: Danh sách giao dịch theo Farm (Toàn bộ lịch sử xuất/nhập/sử dụng của trang trại).

## 4. Payment API
17. `POST /api/v1/payment/create`: Tạo yêu cầu thanh toán qua SePay.
18. `GET /api/v1/payments/result`: Kiểm tra kết quả thanh toán.
19. `POST /api/v1/payment/ipn`: Xử lý thông báo thanh toán tự động (IPN).

## 5. Crop API
20. `GET /api/v1/crops`: PUBLIC Lấy danh sách cây trồng hệ thống (SYSTEM scope).
21. `POST /api/v1/crops`: ADMIN Tạo cây trồng hệ thống mới.
22. `POST /api/v1/crop-type`: ADMIN Tạo loại cây trồng mới.
23. `GET /api/v1/farms/{farmId}/crops`: PUBLIC Lấy danh sách cây trồng của trang trại (FARM scope).
24. `GET /api/v1/farms/{farmId}/crops/{cropId}`: PUBLIC Lấy chi tiết cây trồng của trang trại.
25. `GET /api/v1/crops/{cropId}`: PUBLIC Lấy chi tiết cây trồng hệ thống.
26. `GET /api/v1/crop-types`: PUBLIC Lấy danh sách loại cây trồng hệ thống.
27. `GET /api/v1/crop-types/{cropTypeId}`: PUBLIC Lấy chi tiết loại cây trồng.
28. `DELETE /api/v1/crop-type/{cropTypeId}`: ADMIN Xóa loại cây trồng.

## 6. Plan API
29. `GET /api/v1/plans`: Lấy danh sách kế hoạch của trang trại (Plan list).
30. `POST /api/v1/plans`: Tạo kế hoạch sản xuất mới.
31. `GET /api/v1/plans/{planId}`: Lấy chi tiết một kế hoạch.
32. `PUT /api/v1/plans/{planId}/time`: Cập nhật thời gian kế hoạch (startDate, endDate).
33. `DELETE /api/v1/plans/{planId}`: Xóa kế hoạch.
34. `GET /api/v1/plans/{planId}/plots`: Lấy danh sách các lô đất (plots) thuộc kế hoạch.
35. `POST /api/v1/plans/{planId}/plots`: Thêm một hoặc nhiều lô đất vào kế hoạch.

## 7. Plot API
36. `GET /api/v1/plots`: Lấy danh sách lô đất (Trả về toàn bộ lô đất trong farm hiện tại).
37. `POST /api/v1/plots`: Tạo lô đất mới thuộc farm hiện tại.
38. `PATCH /api/v1/plots/{plotId}`: Cập nhật thông tin của một lô đất theo ID.
39. `DELETE /api/v1/plots/{plotId}`: Xóa một lô đất khỏi farm theo ID.

## 8. Subscription API
40. `GET /api/v1/subscriptions`: Danh sách các gói đăng ký.
41. `GET /api/v1/subscriptions/history`: Lịch sử đăng ký của farm.
42. `GET /api/v1/subscriptions/current`: Thông tin gói hiện tại.

## 9. Task Material API
43. `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials`: Danh sách vật tư của Task.
44. `POST /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials`: Thêm vật tư cho Task (Gán vật tư từ kho vào công việc).
45. `DELETE /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/materials/{materialId}`: Xóa vật tư khỏi Task.

## 10. WorkLog API
46. `GET /api/v1/worklogs`: Lấy danh sách WorkLog toàn farm (Hỗ trợ filter theo ngày `from`, `to`).
47. `GET /api/v1/worklogs/{workLogId}`: Xem chi tiết một WorkLog (Bao gồm thông tin vật tư tiêu hao).
48. `GET /api/v1/worklogs/summary`: Tổng hợp số công và tiền lương theo nhân viên trong khoảng thời gian.
49. `GET /api/v1/worklogs/employee/{employeeId}`: Lấy danh sách WorkLog của một nhân viên cụ thể.
50. `GET /api/v1/plans/{planId}/worklogs`: Lấy danh sách WorkLog theo kế hoạch (Dùng cho quản lý điểm danh).
51. `GET /api/v1/plans/{planId}/stages/{planStageId}/tasks/{taskId}/worklogs`: Lấy danh sách WorkLog chi tiết theo từng công việc.

## 11. PlanStage API
52. `GET /api/v1/plans/{planId}/stages`: Lấy danh sách giai đoạn sản xuất của kế hoạch.
53. `POST /api/v1/plans/{planId}/stages`: Tạo giai đoạn sản xuất mới.
54. `GET /api/v1/plans/{planId}/stages/{stageId}`: Lấy chi tiết một giai đoạn.
55. `PUT /api/v1/plans/{planId}/stages/{stageId}/time`: Cập nhật thời gian giai đoạn (startDate, endDate).
56. `PATCH /api/v1/plans/{planId}/stages/{stageId}`: Cập nhật thông tin giai đoạn.
57. `DELETE /api/v1/plans/{planId}/stages/{stageId}`: Xóa giai đoạn.

## 12. Task Status API
58. `PUT /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/status/{taskStatusId}`: Cập nhật trạng thái Task.
59. `GET /api/v1/task-statuses`: Danh sách tất cả trạng thái công việc hệ thống.
60. `GET /api/v1/task-status-transitions`: Danh sách chuyển đổi trạng thái hợp lệ theo Farm.
61. `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/status-histories`: Lịch sử thay đổi trạng thái của Task.
62. `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/available-statuses`: Danh sách trạng thái tiếp theo hợp lệ.

## 13. Auth API
63. `POST /api/v1/auth/register`: Đăng ký tài khoản mới.
64. `POST /api/v1/auth/login`: Đăng nhập hệ thống.
65. `POST /api/v1/auth/verify`: Xác thực tài khoản qua mã/email.
66. `POST /api/v1/auth/register/resend-mail`: Gửi lại email xác thực.
67. `POST /api/v1/auth/refresh`: Làm mới Token truy cập.

## 14. Task Dependency API
68. `POST /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/dependencies`: Tạo quan hệ phụ thuộc giữa các Task.
69. `GET /api/v1/tasks/{taskId}/dependencies`: Lấy danh sách Task mà Task hiện tại phụ thuộc vào.
70. `DELETE /api/v1/tasks/{taskId}/dependencies/{dependsOnTaskId}`: Xóa quan hệ phụ thuộc.

## 15. Task API
Quản lý công việc (Task) trong giai đoạn kế hoạch.

71. `GET /api/v1/plans/{planId}/stages/{stageId}/tasks`: Danh sách công việc trong một giai đoạn.
72. `POST /api/v1/plans/{planId}/stages/{stageId}/tasks`: Tạo TASK mới (Yêu cầu `plotId`, `name`, `startDate`, `endDate`).
73. `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}`: Lấy chi tiết một công việc theo ID.
74. `PUT /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/time`: Cập nhật thời gian thực hiện TASK (Bao gồm `version`, `startDate`, `endDate`).
75. `PATCH /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}`: Cập nhật thông tin chi tiết TASK (Tên, mô tả, lô đất, tiến độ...).
76. `DELETE /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}`: Xóa công việc khỏi giai đoạn.
77. `GET /api/v1/tasks/assigned`: Lấy danh sách Task được giao cho user (Pageable). Yêu cầu `userId` và `pageable` (page, size, sort).
78. `GET /api/v1/tasks/assigned/today`: Lấy danh sách Task được giao hôm nay. Yêu cầu `userId`.
79. `GET /api/v1/tasks/assigned/by-date`: Lấy danh sách Task được giao theo ngày cụ thể (Pageable). Yêu cầu `userId`, `date`, và `pageable`.

## 16. task-assignee-controller
80. `GET /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/assignees`: Danh sách nhân sự thực hiện Task.
81. `POST /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/assignees`: Giao việc cho nhân sự (userId).
82. `DELETE /api/v1/plans/{planId}/stages/{stageId}/tasks/{taskId}/assignees/{assigneeId}`: Gỡ bỏ nhân sự khỏi Task.

## 17. farm-invitation-controller
83. `GET /api/v1/farms/{farmId}/members`: Danh sách thành viên trong Farm.
84. `POST /api/v1/farms/{farmId}/members`: Mời thành viên mới tham gia Farm.
85. `DELETE /api/v1/farms/{farmId}/members/{memberId}`: Xóa thành viên khỏi Farm.
86. `GET /api/v1/farms/{farmId}/invitations`: Danh sách lời mời đã gửi của Farm.
87. `GET /api/v1/farms/{farmId}/invitations/{invitationId}`: Xem chi tiết lời mời.
88. `PATCH /api/v1/farms/{farmId}/invitations/{invitationId}/cancel`: Hủy lời mời tham gia Farm.
89. `GET /api/v1/invitations/me`: Danh sách lời mời tôi nhận được.
90. `POST /api/v1/invitations/{invitationId}/accept`: Chấp nhận lời mời tham gia Farm.
91. `GET /api/v1/invitations/{invitationId}/preview`: Xem thông tin Farm trước khi chấp nhận lời mời.
92. `GET /api/v1/farms/roles`: Danh sách các vai trò (Roles) trong Farm.

## 18. warehouse-controller
93. `GET /api/v1/farms/{farmId}/warehouses`: Danh sách kho trong Farm.
94. `POST /api/v1/farms/{farmId}/warehouses`: Tạo kho mới.
95. `DELETE /api/v1/farms/{farmId}/warehouses/{warehouseId}`: Xóa kho.
96. `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/locations`: Danh sách vị trí (Location) trong kho.
97. `POST /api/v1/farms/{farmId}/warehouses/{warehouseId}/locations`: Tạo vị trí mới trong kho.
98. `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/locations/{locationId}`: Chi tiết vị trí trong kho.

## 19. warehouse-item-controller
99. `GET /api/v1/farms/{farmId}/warehouses/{warehouseId}/items`: Danh sách vật tư trong kho cụ thể.
100. `GET /api/v1/farms/{farmId}/warehouses/items`: Toàn bộ vật tư trong Farm (tất cả kho).
101. `POST /api/v1/farms/{farmId}/warehouses/{warehouseId}/items`: Thêm vật tư mới vào kho.
102. `PATCH /api/v1/farms/{farmId}/warehouses/{warehouseId}/items/{warehouseItemId}`: Cập nhật thông tin vật tư.
103. `DELETE /api/v1/farms/{farmId}/warehouses/{warehouseId}/items/{warehouseItemId}`: Xóa vật tư khỏi kho.
104. `DELETE /api/v1/farms/{farmId}/items/{warehouseItemId}`: Xóa vật tư hoàn toàn khỏi Farm.

## 20. supplier-controller
105. `GET /api/v1/farms/{farmId}/suppliers`: Danh sách nhà cung cấp của Farm.
106. `POST /api/v1/farms/{farmId}/suppliers`: Thêm nhà cung cấp mới.
107. `DELETE /api/v1/farms/{farmId}/suppliers/{supplierId}`: Xóa nhà cung cấp.

## 21. sku-controller
108. `GET /api/v1/farms/{farmId}/skus`: Danh sách SKU vật tư.
109. `POST /api/v1/farms/{farmId}/skus`: Tạo SKU mới.
110. `DELETE /api/v1/farms/{farmId}/skus/{sku}`: Xóa SKU.

## 22. user-controller
111. `GET /api/v1/users`: Danh sách tất cả người dùng (Admin).
112. `GET /api/v1/users/need-new-verification`: Danh sách người dùng cần xác thực lại.
113. `DELETE /api/v1/users/{userId}`: Xóa người dùng hệ thống.

## 23. unit-controller
114. `GET /api/v1/units`: Danh sách đơn vị đo lường hệ thống.
