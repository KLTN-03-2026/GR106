package com.farmapp.farmsmartmanagement.modules.auth.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository repository;
    private final PermissionCacheService cache;

    public List<SimpleGrantedAuthority> loadAuthorities(UUID userId, UUID farmId) {

        // 1. Try cache
        List<String> cached = cache.get(userId, farmId);
        if (cached != null) {
            return cached.stream()
                    .map(SimpleGrantedAuthority::new)
                    .toList();
        }

        // 2. Load DB
        List<String> permissions = repository.findPermissions(userId, farmId);

        // 3. Cache
        cache.save(userId, farmId, permissions);

        return permissions.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
    }

    public List<String> loadSystemRoles(UUID userId) {
        List<String> cached = cache.get(userId, null);
        if (cached != null) return cached;

        List<String> roles = repository.findSystemRoles(userId);
        cache.save(userId, null, roles);
        return roles;
    }
}