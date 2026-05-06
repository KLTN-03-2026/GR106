package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "harvest_records", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HarvestRecordEntity {

    @Id
    @GeneratedValue(generator = "uuid-v7")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanEntity plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_stage_id")
    private PlanStageEntity planStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plot_id")
    private PlotEntity plot;

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @Column(name = "batch_number", nullable = false)
    private Short batchNumber = 1;

    @Column(name = "quantity", precision = 10, scale = 3, nullable = false)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitEntity unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quality_grade_id")
    private QualityGradeEntity qualityGrade;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    // estimated_revenue là cột GENERATED ALWAYS AS (quantity * unit_price) STORED
    // nên không cần set trong code, chỉ đọc từ DB
    @Column(name = "estimated_revenue", precision = 15, scale = 2, insertable = false, updatable = false)
    private BigDecimal estimatedRevenue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "harvested_by")
    private UserEntity harvestedBy;

    @Column(name = "is_early_harvest", nullable = false)
    private boolean isEarlyHarvest = false;

    @Column(name = "early_harvest_reason")
    private String earlyHarvestReason;

    @Column(name = "is_partial", nullable = false)
    private boolean isPartial = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_item_id")
    private WarehouseItemEntity warehouseItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_location_id")
    private WarehouseLocationEntity warehouseLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_transaction_id")
    private WarehouseTransactionEntity warehouseTransaction;

    @Column(name = "notes")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private UserEntity createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
