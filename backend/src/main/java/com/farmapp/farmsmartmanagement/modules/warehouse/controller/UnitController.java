package com.farmapp.farmsmartmanagement.modules.warehouse.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.UnitResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.service.UnitService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UnitController {
    UnitService unitService;

    @GetMapping("/api/v1/units")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllUnits(){
        return ResponseUtil.success(
                unitService.getAllUnit()
        );
    }
}
