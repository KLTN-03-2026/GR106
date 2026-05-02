package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.PlotStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Geometry;

import java.util.UUID;

@Entity
@Table(name = "plots")
@Getter
@Setter
@SQLRestriction("deleted_at IS NULL")
public class PlotEntity extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private FarmEntity farm;

    @Column(nullable = false)
    private String name;

    @Version
    @Column(name = "version", nullable = false)
    Long version;

    @Column(name = "area_ha")
    private Double areaHa;

    @Column(columnDefinition = "geometry(Polygon,4326)")
    private Geometry geometry;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "plot_status")
    private PlotStatus status;

    private String description;
}