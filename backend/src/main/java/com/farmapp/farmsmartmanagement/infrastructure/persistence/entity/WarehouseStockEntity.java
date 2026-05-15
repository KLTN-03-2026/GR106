package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "warehouse_stock",
        uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_item_id", "location_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseStockEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_item_id", nullable = false)
    WarehouseItemEntity warehouseItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    WarehouseLocationEntity location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @Column(name = "qty_on_hand", precision = 10, scale = 3, nullable = false)
    BigDecimal qtyOnHand = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "last_updated_at", nullable = false)
    LocalDateTime lastUpdatedAt;
}
