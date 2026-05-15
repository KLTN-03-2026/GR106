-- ============================================================
-- V5__cleanup_redundant_columns.sql
-- ============================================================

-- 1. Xóa cột stock trực tiếp trên warehouse_items
--    Tồn kho đã được quản lý qua warehouse_stock + trigger fn_update_stock
ALTER TABLE warehouse_items
DROP COLUMN IF EXISTS stock;

-- 2. Xóa warehouse_location_id trên warehouse_items
--    Location được track qua warehouse_stock(location_id), không cần ở đây
ALTER TABLE warehouse_items
DROP COLUMN IF EXISTS warehouse_location_id;

-- 3. Xóa warehouse_location_id trên work_log_materials
--    Location đã biết qua warehouse_items → warehouse_stock
ALTER TABLE work_log_materials
DROP COLUMN IF EXISTS warehouse_location_id;

-- 4. Fix suppliers — tạo lại đúng với UUID primary key
DROP TABLE IF EXISTS suppliers CASCADE;
CREATE TABLE suppliers (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code VARCHAR(100) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    farm_id       UUID         NOT NULL REFERENCES farms(id),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, supplier_code)
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers FORCE ROW LEVEL SECURITY;

CREATE POLICY suppliers_select ON suppliers
    FOR SELECT USING (is_bypass_rls() OR farm_id = current_farm_id());
CREATE POLICY suppliers_insert ON suppliers
    FOR INSERT WITH CHECK (is_bypass_rls() OR farm_id = current_farm_id());
CREATE POLICY suppliers_update ON suppliers
    FOR UPDATE
    USING (is_bypass_rls() OR farm_id = current_farm_id())
    WITH CHECK (is_bypass_rls() OR farm_id = current_farm_id());
CREATE POLICY suppliers_delete ON suppliers
    FOR DELETE USING (is_bypass_rls() OR farm_id = current_farm_id());

-- 5. warehouse_items: đổi supplier_code (string) → supplier_id (UUID FK)
ALTER TABLE warehouse_items
DROP COLUMN IF EXISTS supplier_code;

ALTER TABLE warehouse_items
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

--


