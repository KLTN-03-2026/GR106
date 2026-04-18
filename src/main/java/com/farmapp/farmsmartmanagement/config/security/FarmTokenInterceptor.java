package com.farmapp.farmsmartmanagement.config.security;

import com.farmapp.farmsmartmanagement.common.annotation.RequiresFarmToken;
import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class FarmTokenInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        if (!(handler instanceof HandlerMethod method)) return true;

        boolean requiresFarm =
                method.hasMethodAnnotation(RequiresFarmToken.class) ||
                        AnnotationUtils.findAnnotation(method.getBeanType(), RequiresFarmToken.class) != null;

        if (!requiresFarm) return true;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (principal.getFarmId() == null) {
            log.warn("Farm token required but got user-only token. userId={}", principal.getUserId());
            throw new AppException(ErrorCode.FARM_TOKEN_REQUIRED);
        }

        return true;
    }

    private String extractFarmIdFromPath(String uri) {
        // /api/v1/farms/{farmId}/...
        String[] parts = uri.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if (parts[i].equals("farms")) {
                return parts[i + 1];
            }
        }
        return null;
    }
}