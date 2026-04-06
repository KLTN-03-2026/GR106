package com.farmapp.farmsmartmanagement.modules.plot.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlotEntity;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.GeometryFormat;
import com.farmapp.farmsmartmanagement.modules.plot.dto.response.PlotResponse;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PlotMapper {

    @Mapping(source = "geometry", target = "geometry")
    PlotResponse toResponse(PlotEntity plotEntity);

    List<PlotResponse> toResponseList(List<PlotEntity> plotEntities);

    // MapStruct sẽ gọi hàm này khi gặp geometry
    default GeometryFormat map(Geometry geometry) {
        if (geometry == null) return null;

        if (geometry instanceof Polygon polygon) {
            List<List<List<Double>>> coordinates = new ArrayList<>();

            List<List<Double>> ring = new ArrayList<>();
            for (Coordinate c : polygon.getCoordinates()) {
                ring.add(Arrays.asList(c.getX(), c.getY()));
            }
            coordinates.add(ring);

            return new GeometryFormat("Polygon", coordinates);
        }

        // Có thể mở rộng cho Point, LineString...
        throw new UnsupportedOperationException("Geometry type not supported: " + geometry.getGeometryType());

    }
}
