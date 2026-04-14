package com.farmapp.farmsmartmanagement.common.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Supplier;

@Component
public class RlsUtils {

    @PersistenceContext
    private EntityManager em;

    public <T> T runAsAdmin(Supplier<T> action) {
        setBypass(true);
        try {
            return action.get();
        } finally {
            setBypass(false);
        }
    }

    public void runAsAdmin(Runnable action) {
        setBypass(true);
        try {
            action.run();
        } finally {
            setBypass(false);
        }
    }

    private void setBypass(boolean bypass) {
        em.createNativeQuery("SELECT set_config('app.bypass_rls', :val, true)") // true = transaction-local
                .setParameter("val", bypass ? "true" : "false")
                .getSingleResult();
    }
}
