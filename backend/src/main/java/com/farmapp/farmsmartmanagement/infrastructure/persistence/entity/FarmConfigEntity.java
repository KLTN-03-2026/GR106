// FarmConfigEntity.java
package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "farm_configs")
@Getter
@Setter
@NoArgsConstructor
public class FarmConfigEntity {

    @Id
    @Column(name = "farm_id")
    private UUID farmId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "farm_id")
    private FarmEntity farm;

    @Version
    @Column(name = "version", nullable = false)
    Long version;

    @Column(nullable = false)
    private String timezone = "Asia/Ho_Chi_Minh";

    @Column(nullable = false)
    private String locale = "vi";

    @Column(nullable = false)
    private String currency = "VND";

    @Column(nullable = false)
    private Boolean allowCropClone = true;

    @Column(nullable = false)
    private Short taskOverdueNotifyDays = 1;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant updatedAt;
}