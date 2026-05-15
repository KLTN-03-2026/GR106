package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "task_materials")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskMaterialEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_item_id", nullable = false)
    WarehouseItemEntity warehouseItem;

    @Column(name = "planned_qty", nullable = false, precision = 10, scale = 3)
    BigDecimal plannedQty;
}
