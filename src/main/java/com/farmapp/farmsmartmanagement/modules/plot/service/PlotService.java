package com.farmapp.farmsmartmanagement.modules.plot.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.domain.enums.PlotStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PlotEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlotRepository;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.CreatePlotRequest;
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.GeometryFormat;
import com.farmapp.farmsmartmanagement.modules.plot.dto.response.PlotResponse;
import com.farmapp.farmsmartmanagement.modules.plot.mapper.PlotMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlotService {

    PlotRepository plotRepository;
    FarmRepository farmRepository;
    PlotMapper plotMapper;


    @Transactional(readOnly = true)
    public List<PlotResponse> getAllPlots() {
        return plotMapper.toResponseList(plotRepository.findAll());
    }


    @Transactional
    public PlotResponse createPlot(UUID farmId, CreatePlotRequest request) {

        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        if(plotRepository.existsByFarmAndName(farm, request.getPlotName()))
            throw new AppException(ErrorCode.PLOT_ALREADY_EXISTS);

        PlotEntity newPlot = new PlotEntity();

        if (request.getGeometry() != null) {
            GeometryFormat geo = request.getGeometry();

            // Chỉ xử lý Polygon
            if ("Polygon".equalsIgnoreCase(geo.type())) {
                GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

                // Lấy danh sách tọa độ từ GeoJSON
                List<List<Double>> ring = geo.coordinates().get(0); // polygon có outer ring
                Coordinate[] coords = ring.stream()
                        .map(c -> new Coordinate(c.get(0), c.get(1)))
                        .toArray(Coordinate[]::new);

                Polygon polygon = geometryFactory.createPolygon(coords);
                newPlot.setGeometry(polygon);
            }
        }

        double areaSquareMeters = newPlot.getGeometry().getArea();
        double areaHa = areaSquareMeters / 10_000; // 1 ha = 10,000 m²
        newPlot.setAreaHa(areaHa);


        newPlot.setName(request.getPlotName());
        newPlot.setFarm(farm);
        newPlot.setStatus(PlotStatus.ACTIVE);
        newPlot.setDescription(request.getDescription());

        plotRepository.save(newPlot);

        return plotMapper.toResponse(newPlot);
    }
}
