-- JOIN qua Item
-- ALTER TABLE task_materials
-- DROP COLUMN unit_id;

-- Không nhất thiết cần vật tư
-- ALTER TABLE task_materials
-- ALTER COLUMN warehouse_item_id DROP NOT NULL;

-- Lỗi design DB -> bổ sung cột
-- ALTER TABLE warehouse_items
-- ADD COLUMN stock DECIMAL(15,2) NOT NULL DEFAULT 0
-- ĐÃ CHẠY-------------------------------




-- Item nằm trong kho nên cũng cần biết nằm ở vị trí nào của kho (NULLABLE)-> từ đó task_material sẽ biết vị trí lấy vật tư
ALTER TABLE warehouse_items
ADD COLUMN warehouse_location_id UUID REFERENCES warehouse_locations(id);

-- Vì giờ đã biết thông qua Item rồi nên không cần đặt ở đây nữa
ALTER TABLE work_log_task_materials
DROP COLUMN warehouse_location_id;

-- => Vậy phải sửa lại "Create/Update Vật tư" và Entity


