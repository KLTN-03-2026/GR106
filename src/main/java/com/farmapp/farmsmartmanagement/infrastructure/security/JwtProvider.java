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

    // TOKEN LEVEL 1 (user only)
    public String generateUserToken(UUID userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getKey())
                .compact();
    }

    // TOKEN LEVEL 2 (user + farm)
    public String generateFarmToken(UUID userId, UUID farmId, List<String> permissions) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("farmId", farmId.toString())
                .claim("perms", permissions) // embed
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getKey())
                .compact();
    }

    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public UserPrincipal getPrincipal(String token) {
        Claims claims = parseClaims(token);

        UUID userId = UUID.fromString(claims.getSubject());
        String farmIdStr = claims.get("farmId", String.class);
        UUID farmId = farmIdStr != null ? UUID.fromString(farmIdStr) : null;

        List<?> rawPerms = claims.get("perms", List.class);

        Collection<? extends GrantedAuthority> authorities;

        if (rawPerms != null) {
            authorities = rawPerms.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(SimpleGrantedAuthority::new)
                    .toList();
        } else {
            authorities = permissionService.loadAuthorities(userId, farmId);
        }

        return new UserPrincipal(userId, farmId, authorities);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

