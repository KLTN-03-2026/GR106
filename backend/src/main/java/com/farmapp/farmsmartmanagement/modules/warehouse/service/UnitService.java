package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.UnitRepository;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.UnitResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.UnitMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UnitService {
    UnitRepository unitRepository;
    UnitMapper unitMapper;

    public List<UnitResponse> getAllUnit(){
        return unitMapper.toUnitResponses(unitRepository.findAll());
    }
}
