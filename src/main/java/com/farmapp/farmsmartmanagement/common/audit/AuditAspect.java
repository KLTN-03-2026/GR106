package com.farmapp.farmsmartmanagement.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.modules.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;
    private final SecurityUtils securityUtils;
    private final ObjectMapper mapper;

    @Around("@annotation(audit)")
    public Object audit(ProceedingJoinPoint pjp, Audit audit) throws Throwable {

        Object result;

        try {
            result = pjp.proceed();
        } catch (Throwable ex) {
            throw ex;
        }

        auditService.log(
                securityUtils.getCurrentUserId(),
                securityUtils.getCurrentFarmId(),
                audit.action(),
                audit.target(),
                extractId(result),
                null,
                toJson(result)
        );

        return result;
    }

    private UUID extractId(Object obj) {
        try {
            var field = obj.getClass().getDeclaredField("id");
            field.setAccessible(true);
            return (UUID) field.get(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }
}