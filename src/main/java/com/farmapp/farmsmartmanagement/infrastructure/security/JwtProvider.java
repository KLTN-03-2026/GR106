package com.farmapp.farmsmartmanagement.infrastructure.security;

import com.farmapp.farmsmartmanagement.config.app.JwtProperties;
import com.farmapp.farmsmartmanagement.modules.auth.service.PermissionService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    private final JwtProperties jwtProperties;
    private final PermissionService permissionService;
    private Key getKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
    }

    // TOKEN LEVEL 1 — thêm system roles vào
    public String generateUserToken(UUID userId, List<String> systemRoles) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("roles", systemRoles) // ["ROLE_ADMIN"] hoặc ["ROLE_USER"]
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getKey())
                .compact();
    }

    // TOKEN LEVEL 2 — thêm system roles + farm permissions
    public String generateFarmToken(UUID userId, UUID farmId,
                                    List<String> systemRoles, List<String> permissions) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("roles", systemRoles)
                .claim("farmId", farmId.toString())
                .claim("perms", permissions)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getKey())
                .compact();
    }

    public UserPrincipal getPrincipal(String token) {
        Claims claims = parseClaims(token);

        UUID userId = UUID.fromString(claims.getSubject());
        String farmIdStr = claims.get("farmId", String.class);
        UUID farmId = farmIdStr != null ? UUID.fromString(farmIdStr) : null;

        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

        // ✅ Load system roles từ token
        List<?> rawRoles = claims.get("roles", List.class);
        if (rawRoles != null) {
            rawRoles.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
        }

        // ✅ Load farm permissions từ token nếu có
        List<?> rawPerms = claims.get("perms", List.class);
        if (rawPerms != null) {
            rawPerms.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
        }

        // ✅ Nếu không có gì trong token → load từ DB (fallback)
        if (authorities.isEmpty()) {
            authorities.addAll(permissionService.loadAuthorities(userId, farmId));
        }

        return new UserPrincipal(userId, farmId, authorities);
    }

    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }



    private Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

