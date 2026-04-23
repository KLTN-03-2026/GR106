package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupplierEntity {

    @Id
    @Column(name = "supplier_code", length = 100)
    String supplierCode; // khóa chính

    @Column(name = "name", nullable = false, unique = true, length = 200)
    String name;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    FarmEntity farm;

}
