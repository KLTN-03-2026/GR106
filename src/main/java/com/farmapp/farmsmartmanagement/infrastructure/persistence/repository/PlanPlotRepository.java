package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlanPlotEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanPlotRepository extends JpaRepository<PlanPlotEntity, UUID> {
    boolean existsByPlanIdAndPlotId(UUID planId, UUID plotId);

    @Query("""
    SELECT pp.plot FROM PlanPlotEntity pp
    WHERE pp.plan.id = :planId
    AND pp.plot.id = :plotId
""")
    Optional<PlotEntity> findPlotByPlanIdAndPlotId(
            @Param("planId") UUID planId,
            @Param("plotId") UUID plotId
    );

    @Query("""
        SELECT DISTINCT pp.plot
        FROM PlanPlotEntity pp
        WHERE pp.plan.id = :planId
    """)
    List<PlotEntity> findPlotsByPlanId(UUID planId);

    List<UUID> findPlotIdsByPlanId(UUID planId);
}
