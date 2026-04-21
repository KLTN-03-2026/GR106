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
import com.farmapp.farmsmartmanagement.modules.plot.dto.request.UpdatePlotRequest;
import com.farmapp.farmsmartmanagement.modules.plot.dto.response.PlotResponse;
import com.farmapp.farmsmartmanagement.modules.plot.mapper.PlotMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlotService {

    PlotRepository plotRepository;
    FarmRepository farmRepository;
    PlotMapper plotMapper;


    @Transactional(readOnly = true)
    public List<PlotResponse> getAllPlots() {
        return plotMapper.toResponseList(
                plotRepository.findAll()
        );
    }


    @Transactional
    public PlotResponse createPlot(UUID farmId, CreatePlotRequest request) {

        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        if (plotRepository.existsByFarmAndName(farm, request.getPlotName()))
            throw new AppException(ErrorCode.PLOT_ALREADY_EXISTS);

        PlotEntity newPlot = new PlotEntity();
        newPlot.setName(request.getPlotName());
        newPlot.setFarm(farm);
        newPlot.setStatus(PlotStatus.ACTIVE);
        newPlot.setDescription(request.getDescription());

        if (request.getGeometry() != null) {
            Geometry geometry = geometryFormatToGeometry(request.getGeometry());
            newPlot.setGeometry(geometry);
            if (geometry instanceof Polygon polygon) {
                newPlot.setAreaHa(calcAreaHa(polygon));
            }
        }

        plotRepository.save(newPlot);
        return plotMapper.toResponse(newPlot);
    }

    @Transactional
    public PlotResponse updatePlot(UUID farmId, UUID plotId, UpdatePlotRequest request) {

        PlotEntity plot = plotRepository.findByIdAndFarmId(plotId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));

        // check trùng name đúng
        if (request.getName() != null
                && !request.getName().equals(plot.getName())
                && plotRepository.existsByFarmAndName(plot.getFarm(), request.getName())) {

            throw new AppException(ErrorCode.PLOT_ALREADY_EXISTS);
        }

        if (request.getName() != null) {
            plot.setName(request.getName());
        }

        if (request.getStatus() != null) {
            plot.setStatus(request.getStatus());
        }

        if (Boolean.TRUE.equals(request.getIsClearDescription())) {
            plot.setDescription(null);
        } else if (request.getDescription() != null) {
            plot.setDescription(request.getDescription());
        }

        if (request.getGeometry() != null) {
            Geometry newGeometry = geometryFormatToGeometry(request.getGeometry());
            plot.setGeometry(newGeometry);

            double areaSquareMeters = newGeometry.getArea();
            plot.setAreaHa(areaSquareMeters / 10_000);
        } else if (Boolean.TRUE.equals(request.getIsClearGeometry())) {
            plot.setGeometry(null);
            plot.setAreaHa((double) 0);
        }

        return plotMapper.toResponse(plot);
    }

    // Chưa cần sử dụng vì đã có hàm update
    @Transactional
    public PlotResponse updateGeometry(UUID plotId, GeometryFormat geometry) {

        PlotEntity plot = plotRepository.findById(plotId)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));

        Geometry newGeometry = geometryFormatToGeometry(geometry);

        plot.setGeometry(newGeometry);

        // tính lại diện tích
        if (newGeometry != null) {
            double areaSquareMeters = newGeometry.getArea();
            double areaHa = areaSquareMeters / 10_000;
            plot.setAreaHa(areaHa);
        } else {
            plot.setAreaHa((double) 0);
        }

        plotRepository.save(plot);

        return plotMapper.toResponse(plot);
    }

    @Transactional
    public void deletePlot(UUID farmId, UUID plotId) {

        PlotEntity plot = plotRepository.findByIdAndFarmId(plotId, farmId)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));

        plot.setDeletedAt(Instant.now());

        plotRepository.save(plot);
    }


    private Geometry geometryFormatToGeometry(GeometryFormat geometry) {
        if (geometry != null) {
            GeometryFormat geo = geometry;

            // Chỉ xử lý Polygon
            if ("Polygon".equalsIgnoreCase(geo.type())) {
                GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

                // Lấy danh sách tọa độ từ GeoJSON
                List<List<Double>> ring = geo.coordinates().get(0); // polygon có outer ring
                Coordinate[] coords = ring.stream()
                        .map(c -> new Coordinate(c.get(0), c.get(1)))
                        .toArray(Coordinate[]::new);


                return geometryFactory.createPolygon(coords);
            }
        }

        return null;
    }

    private double calcAreaHa(Polygon polygon) {
        Coordinate[] coords = polygon.getCoordinates();
        double area = 0;
        int n = coords.length;

        for (int i = 0; i < n - 1; i++) {
            double lat1 = Math.toRadians(coords[i].getY());
            double lat2 = Math.toRadians(coords[i + 1].getY());
            double dLon = Math.toRadians(coords[i + 1].getX() - coords[i].getX());

            area += dLon * (2 + Math.sin(lat1) + Math.sin(lat2));
        }

        // R = bán kính trái đất (m)
        double R = 6_378_137.0;
        area = Math.abs(area * R * R / 2.0);  // m²
        return area / 10_000;                 // → ha
    }
}
