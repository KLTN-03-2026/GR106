package com.farmapp.farmsmartmanagement.modules.farm.controller;


import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.MemberService;
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
public class MemberController {

    MemberService memberService;

    @GetMapping("/api/v1/farms/roles")
    public ResponseEntity<ApiResponse<List<FarmRoleResponse>>> findAllFarmRoles()
    {
        return ResponseUtil.success(
                memberService.findAll()
        );
    }
}
