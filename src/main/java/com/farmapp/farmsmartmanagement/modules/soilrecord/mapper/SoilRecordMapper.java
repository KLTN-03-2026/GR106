package com.farmapp.farmsmartmanagement.modules.soilrecord.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SoilRecordEntity;
import com.farmapp.farmsmartmanagement.modules.plot.mapper.PlotMapper;
import com.farmapp.farmsmartmanagement.modules.soilrecord.dto.response.SoilRecordResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring",uses = {PlotMapper.class})
public interface SoilRecordMapper {
    SoilRecordResponse toResponse(SoilRecordEntity entity);

    List<SoilRecordResponse> toResponses(List<SoilRecordEntity> entities);


}
