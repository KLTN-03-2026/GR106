package com.farmapp.farmsmartmanagement.domain.enums;

public enum WarehouseTxnType {
    IMPORT_MANUAL, //Nhập kho thủ công. Người dùng hoặc quản lý kho nhập thêm vật tư vào kho
                    // mà không gắn với task cụ thể (ví dụ nhập hàng từ nhà cung cấp).

    EXPORT_TASK, //Xuất kho cho một công việc cụ thể (task).
                // Ví dụ: cấp vật tư cho nhân viên để thực hiện công việc trên đồng ruộng.

    EXPORT_MANUAL, //Xuất kho thủ công, không gắn với task.
                // Thường dùng khi lấy vật tư ra khỏi kho cho mục đích khác (ví dụ kiểm kê, thử nghiệm).

    HARVEST_IN, //Nhập kho từ hoạt động thu hoạch.
                // Sản phẩm thu hoạch được ghi nhận vào kho như một loại hàng hóa mới.

    ADJUST, //Điều chỉnh tồn kho.
            // Dùng khi có sai lệch giữa số liệu thực tế và hệ thống (ví dụ kiểm kê phát hiện thiếu/thừa).

    TRANSFER_OUT, //Xuất kho từ một location để chuyển sang location khác.
                // Đây là phần xuất của giao dịch chuyển kho.

    TRANSFER_IN //Nhập kho vào location mới sau khi chuyển từ location khác.
                // Đây là phần nhập của giao dịch chuyển kho.

}
