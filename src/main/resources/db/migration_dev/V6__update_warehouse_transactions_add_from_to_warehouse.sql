-- Bỏ constraint cũ
ALTER TABLE warehouse_transactions DROP CONSTRAINT chk_txn_location;

-- Thêm 2 cột mới
ALTER TABLE warehouse_transactions
    ADD COLUMN from_warehouse_id UUID REFERENCES warehouses(id),
    ADD COLUMN to_warehouse_id   UUID REFERENCES warehouses(id);

-- Thêm constraint mới cho 2 cột warehouse
ALTER TABLE warehouse_transactions
    ADD CONSTRAINT chk_txn_warehouse CHECK (
        (type IN ('EXPORT_TASK','EXPORT_MANUAL','TRANSFER_OUT','ADJUST')
            AND from_warehouse_id IS NOT NULL)
        OR
        (type IN ('IMPORT_MANUAL','HARVEST_IN','TRANSFER_IN')
            AND to_warehouse_id IS NOT NULL)
    );
