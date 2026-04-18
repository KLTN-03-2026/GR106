package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.CropScope;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@SQLRestriction("deleted_at IS NULL")
public class WarehouseEntity extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "description")
    String description;

    @Column(name = "address")
    String address;

    @Column(name = "latitude", precision = 9, scale = 6)
    BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    BigDecimal longitude;

    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    UserEntity createdBy;
}