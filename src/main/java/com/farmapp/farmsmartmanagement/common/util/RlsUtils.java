package com.farmapp.farmsmartmanagement.common.util;

import com.farmapp.farmsmartmanagement.config.database.RlsContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Supplier;


@Slf4j
@Component
public class RlsUtils {

    @PersistenceContext
    private EntityManager em;

    public <T> T runAsAdmin(Supplier<T> action) {
        UUID prevFarm = RlsContext.getFarmId();
        UUID prevUser = RlsContext.getUserId();

        RlsContext.setBypass(true);
        syncToDb();
        try {
            return action.get();
        } finally {
            RlsContext.setBypass(false);
            RlsContext.set(prevFarm, prevUser);
            try {
                syncToDb();
            } catch (Exception e) {
                log.warn("[RlsUtils] Failed to reset bypass_rls", e);
            }
        }
    }

    // Delegate — không duplicate logic
    public void runAsAdmin(Runnable action) {
        runAsAdmin(() -> {
            action.run();
            return null;
        });
    }

    private void syncToDb() {
        String userId = RlsContext.hasUser()
                ? RlsContext.getUserId().toString() : "";
        String farmId = RlsContext.hasFarm()
                ? RlsContext.getFarmId().toString() : "";
        String bypass = RlsContext.isBypass() ? "true" : "false";

        em.createNativeQuery(
                        "SELECT set_config('app.current_user_id', :u, false)," +
                                "       set_config('app.current_farm_id', :f, false)," +
                                "       set_config('app.bypass_rls', :b, false)")
                .setParameter("u", userId)
                .setParameter("f", farmId)
                .setParameter("b", bypass)
                .getSingleResult();
    }
}