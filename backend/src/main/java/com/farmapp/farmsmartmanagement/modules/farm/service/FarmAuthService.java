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

        // Chỉ cần check farm_members — owner cũng có row ở đây
        FarmMemberEntity member = farmMemberRepository
                .findByFarm_IdAndUser_Id(farmId, userId)
                .filter(FarmMemberEntity::getIsActive)
                .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN));

        // Farm có tồn tại không (soft delete)
        farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        String farmRole = member.getFarmRole().getName(); // OWNER | MANAGER | WORKER

        // Load permissions theo role (có cache)
        List<String> permissions = permissionCacheService.get(userId, farmId);
        if (permissions == null) {
            permissions = permissionRepository.findPermissionsByFarmRole(farmRole);
            permissionCacheService.save(userId, farmId, permissions);
        }

        List<String> systemRoles = permissionRepository.findSystemRoles(userId);

        return new FarmSelectResponse(
                jwtProvider.generateFarmToken(userId, member.getUser().getEmail(), farmId, systemRoles, permissions)
        );
    }
}