package com.farmapp.farmsmartmanagement.common.util;

import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

// SecurityUtils.java
@Component
public class SecurityUtils {

    private UserPrincipal getPrincipal() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal))
            return null;
        return (UserPrincipal) auth.getPrincipal();
    }

    public UUID getCurrentUserId() {
        UserPrincipal p = getPrincipal();
        return p != null ? p.getUserId() : null;
    }

    public UUID getCurrentFarmId() {
        UserPrincipal p = getPrincipal();
        return p != null ? p.getFarmId() : null;
    }

    public String getCurrentUserEmail() {
        UserPrincipal p = getPrincipal();
        return p != null ? p.getEmail() : null;
    }
}
