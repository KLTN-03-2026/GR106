package com.farmapp.farmsmartmanagement.modules.farm.controller;

import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.CreateFarmRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.FarmService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmController {

    FarmService farmService;

    @PreAuthorize("hasRole('USER') or hasAuthority('farm:create')")
    @PostMapping("/api/v1/farm")
    public ApiResponse<FarmResponse> createFarm(@RequestBody CreateFarmRequest request){
        return ApiResponse.created(farmService.createFarm(request));
    }
}
