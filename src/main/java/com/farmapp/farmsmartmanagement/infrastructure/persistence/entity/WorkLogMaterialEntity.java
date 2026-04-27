package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "work_log_materials")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkLogMaterialEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_log_id", nullable = false)
    WorkLogEntity workLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_item_id", nullable = false)
    WarehouseItemEntity warehouseItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_location_id")
    WarehouseLocationEntity warehouseLocation;

    @Column(name = "used_qty", precision = 10, scale = 3, nullable = false)
    BigDecimal usedQty;

    @Column(name = "deviation_reason")
    String deviationReason;
}
