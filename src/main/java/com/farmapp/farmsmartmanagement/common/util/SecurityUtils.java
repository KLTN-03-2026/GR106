package com.farmapp.farmsmartmanagement.common.util;

import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtils {

    public UUID getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return ((UserPrincipal) auth.getPrincipal()).getUserId();
    }

    public UUID getCurrentFarmId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return ((UserPrincipal) auth.getPrincipal()).getFarmId();
    }
}
