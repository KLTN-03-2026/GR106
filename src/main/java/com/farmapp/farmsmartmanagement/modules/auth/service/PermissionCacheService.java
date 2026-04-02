package com.farmapp.farmsmartmanagement.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionCacheService {

    private final StringRedisTemplate redis;

    private String key(UUID userId, UUID farmId) {
        return "perm:v1:user:" + userId +
                ":farm:" + (farmId != null ? farmId : "none");
    }

    public void save(UUID userId, UUID farmId, List<String> permissions) {
        redis.opsForValue().set(
                key(userId, farmId),
                String.join(",", permissions),
                Duration.ofMinutes(10)
        );
    }

    public List<String> get(UUID userId, UUID farmId) {
        String val = redis.opsForValue().get(key(userId, farmId));
        if (val == null) return null;
        return List.of(val.split(","));
    }

    public void evict(UUID userId, UUID farmId) {
        redis.delete(key(userId, farmId));
    }
}