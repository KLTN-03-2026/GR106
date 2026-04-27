package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.WarehouseTxnType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.sql.SQLType;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "warehouse_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseTransactionEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    WarehouseEntity warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_item_id", nullable = false)
    WarehouseItemEntity warehouseItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_location_id")
    WarehouseLocationEntity fromLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_location_id")
    WarehouseLocationEntity toLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_warehouse_id")
    WarehouseEntity fromWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_warehouse_id")
    WarehouseEntity toWarehouse;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false)
    WarehouseTxnType type;

    @Column(name = "qty_change", precision = 10, scale = 3, nullable = false)
    BigDecimal qtyChange;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ref_transfer_id")
    WarehouseTransactionEntity refTransfer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ref_work_log_id")
    WorkLogEntity refWorkLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ref_task_id")
    TaskEntity refTask;

    @Column(name = "ref_harvest_id")
    UUID refHarvestId; // FK thêm sau (circular ref với harvest_records)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    UserEntity performedBy;

    @Column(name = "notes")
    String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;
}
