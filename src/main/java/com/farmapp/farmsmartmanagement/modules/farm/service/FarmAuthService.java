package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmMemberEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmMemberRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PermissionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.security.JwtProvider;
import com.farmapp.farmsmartmanagement.modules.auth.service.PermissionCacheService;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmSelectResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FarmAuthService {

    private final FarmRepository farmRepository;
    private final FarmMemberRepository farmMemberRepository;
    private final PermissionRepository permissionRepository;
    private final PermissionCacheService permissionCacheService;
    private final JwtProvider jwtProvider;

    @Transactional
    public FarmSelectResponse selectFarm(UUID userId, UUID farmId) {

        // Check owner trước (owner không cần có row farm_members)
        boolean isOwner = farmRepository
                .findById(farmId)
                .map(farm -> userId.equals(farm.getOwner().getId()))
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // Nếu không phải owner thì check active member
        boolean isMember = !isOwner && farmMemberRepository
                .findByFarm_IdAndUser_Id(farmId, userId)
                .map(FarmMemberEntity::getIsActive)
                .orElse(false);

        if (!isOwner && !isMember) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Load system roles
        List<String> systemRoles = permissionRepository.findSystemRoles(userId);

        // Load farm permissions (có cache)
        List<String> cached = permissionCacheService.get(userId, farmId);
        List<String> permissions;
        if (cached != null) {
            permissions = cached;
        } else {
            permissions = permissionRepository.findPermissions(userId, farmId);
            permissionCacheService.save(userId, farmId, permissions);
        }

        return new FarmSelectResponse(jwtProvider.generateFarmToken(userId, farmId, systemRoles, permissions));
    }
}