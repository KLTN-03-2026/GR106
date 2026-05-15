package com.farmapp.farmsmartmanagement.modules.farm.controller;


import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.annotation.RequiresSubscription;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.domain.enums.InvitationStatus;
import com.farmapp.farmsmartmanagement.domain.enums.LimitType;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.InvitationRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmInvitationResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmMemberResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.InvitationPreviewResponse;
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
                farmInvitationService.findAllFarmRole()
        );
    }

    @GetMapping("/api/v1/farms/{farmId}/members")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<FarmMemberResponse>>> findAllFarmMember(
            @PathVariable("farmId") UUID farmId
    ) {
        return ResponseUtil.success(
                farmInvitationService.findAllFarmMember(
                        farmId
                )
        );
    }

    @PostMapping("/api/v1/farms/{farmId}/members")
    @RequiresFarmToken
    @RequiresSubscription(checkLimits = true, limitType = LimitType.MEMBER)
    public ResponseEntity<ApiResponse<Void>> InviteFarmMember(
            @PathVariable("farmId")UUID farmId,
            @RequestBody @Valid InvitationRequest invitationRequest
    ) {
        farmInvitationService.inviteMember(farmId, invitationRequest);

        return ResponseUtil.noContent();
    }

    @GetMapping("/api/v1/farms/{farmId}/invitations/{invitationId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> resendInvitation(
            @PathVariable UUID farmId,
            @PathVariable UUID invitationId
    ) {
        farmInvitationService.resendInvitation(farmId, invitationId);

        return ResponseUtil.noContent();
    }

    // Hủy lời mời
    @PatchMapping("/api/v1/farms/{farmId}/invitations/{invitationId}/cancel")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @PathVariable UUID farmId,
            @PathVariable UUID invitationId
    ) {
        farmInvitationService.cancelInvitation(farmId, invitationId);
        return ResponseUtil.noContent();
    }

    // Xóa thành viên
    @DeleteMapping("/api/v1/farms/{farmId}/members/{memberId}")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID farmId,
            @PathVariable UUID memberId
    ) {
        farmInvitationService.removeMember(farmId, memberId);
        return ResponseUtil.noContent();
    }

    // FarmInvitationController.java — thêm 2 endpoint

    @GetMapping("/api/v1/invitations/me")
    public ResponseEntity<ApiResponse<List<FarmInvitationResponse>>> findAllMyInvitations(
            @RequestParam(required = false) InvitationStatus status
    ) {
        return ResponseUtil.success(
                farmInvitationService.findAllMyInvitations(status)
        );
    }

    @PostMapping("/api/v1/invitations/{invitationId}/accept")
    public ResponseEntity<ApiResponse<FarmMemberResponse>> acceptInvitation(
            @PathVariable UUID invitationId
    ) {
        return ResponseUtil.success(
                farmInvitationService.acceptInvitation(invitationId)
        );
    }

    @GetMapping("/api/v1/farms/{farmId}/invitations")
    @RequiresFarmToken
    public ResponseEntity<ApiResponse<List<FarmInvitationResponse>>> findAllInvitationsByFarm(
            @PathVariable UUID farmId,
            @RequestParam(required = false) InvitationStatus status
    ) {
        return ResponseUtil.success(
                farmInvitationService.findAllInvitationsByFarm(farmId, status)
        );
    }

    // Không cần auth — dùng để hiển thị thông tin trước khi login
    @GetMapping("/api/v1/invitations/{invitationId}/preview")
    public ResponseEntity<ApiResponse<InvitationPreviewResponse>> previewInvitation(
            @PathVariable UUID invitationId
    ) {
        return ResponseUtil.success(
                farmInvitationService.previewInvitation(invitationId)
        );
    }
}
