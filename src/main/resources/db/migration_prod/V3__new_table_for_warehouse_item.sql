CREATE TABLE skus(
    sku VARCHAR(100) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    farm_id UUID NOT NULL REFERENCES farms(id),
    UNIQUE(farm_id,sku)
);

CREATE TABLE suppliers(
    supplier_code VARCHAR(100) PRIMARY KEY DEFAULT,
    name VARCHAR(200) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    farm_id UUID NOT NULL REFERENCES farms(id),
    UNIQUE(farm_id, supplier_code)
);

ALTER TABLE warehouse_items
DROP COLUMN sku;

ALTER TABLE warehouse_items
DROP COLUMN supplier;

ALTER TABLE warehouse_items
ADD COLUMN sku VARCHAR(100) NOT NULL REFERENCES skus(sku);

ALTER TABLE warehouse_items
ADD COLUMN supplier_code UUID NOT NULL REFERENCES suppliers(supplier_code);

ALTER TABLE warehouse_items
ADD CONSTRAINT warehouse_items_warehouse_sku_unique UNIQUE (warehouse_id, sku); -- Mỗi sku duy nhất tại mỗi kho

ALTER TABLE warehouse_items
ALTER COLUMN supplier_code DROP NOT NULL;


DO $$
BEGIN
  -- Bảng skus
  ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
  ALTER TABLE skus FORCE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS skus_select ON skus;
  DROP POLICY IF EXISTS skus_insert ON skus;
  DROP POLICY IF EXISTS skus_update ON skus;
  DROP POLICY IF EXISTS skus_delete ON skus;

  CREATE POLICY skus_select ON skus
    FOR SELECT USING (is_bypass_rls() OR farm_id = current_farm_id());

  CREATE POLICY skus_insert ON skus
    FOR INSERT WITH CHECK (is_bypass_rls() OR farm_id = current_farm_id());

  CREATE POLICY skus_update ON skus
    FOR UPDATE USING (is_bypass_rls() OR farm_id = current_farm_id())
    WITH CHECK (is_bypass_rls() OR farm_id = current_farm_id());

  CREATE POLICY skus_delete ON skus
    FOR DELETE USING (is_bypass_rls() OR farm_id = current_farm_id());

  -- Bảng suppliers
  ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE suppliers FORCE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS suppliers_select ON suppliers;
  DROP POLICY IF EXISTS suppliers_insert ON suppliers;
  DROP POLICY IF EXISTS suppliers_update ON suppliers;
  DROP POLICY IF EXISTS suppliers_delete ON suppliers;

  CREATE POLICY suppliers_select ON suppliers
    FOR SELECT USING (is_bypass_rls() OR farm_id = current_farm_id());

  CREATE POLICY suppliers_insert ON suppliers
    FOR INSERT WITH CHECK (is_bypass_rls() OR farm_id = current_farm_id());

  CREATE POLICY suppliers_update ON suppliers
    FOR UPDATE USING (is_bypass_rls() OR farm_id = current_farm_id())
    WITH CHECK (is_bypass_rls() OR farm_id = current_farm_id());

  CREATE POLICY suppliers_delete ON suppliers
    FOR DELETE USING (is_bypass_rls() OR farm_id = current_farm_id());
END $$;
