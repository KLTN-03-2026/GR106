package com.farmapp.farmsmartmanagement.modules.farm.controller;


import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.InvitationRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmInvitationResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.service.FarmInvitationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmInvitationController {

    FarmInvitationService farmInvitationService;

    @GetMapping("/api/v1/farms/roles")
    public ResponseEntity<ApiResponse<List<FarmRoleResponse>>> findAllFarmRoles()
    {
        return ResponseUtil.success(
                farmInvitationService.findAll()
        );
    }

    @PostMapping("/api/v1/farms/{farmId}/member")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<FarmInvitationResponse>> InviteFarmMember(
            @PathVariable("farmId")UUID farmId,
            @RequestBody @Valid InvitationRequest invitationRequest
    ) {
        return ResponseUtil.success(
                farmInvitationService.inviteMember(
                        farmId,
                        invitationRequest
                )
        );
    }
}
