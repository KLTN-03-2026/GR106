package com.farmapp.farmsmartmanagement.config.database;

import java.util.UUID;

public final class RlsContext {

    private static final ThreadLocal<UUID> FARM_ID = new ThreadLocal<>();
    private static final ThreadLocal<UUID> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> BYPASS = new ThreadLocal<>(); // ✅ thêm

    private RlsContext() {}

    public static void setBypass(boolean bypass) {
        BYPASS.set(bypass);
    }

    public static boolean isBypass() {
        return Boolean.TRUE.equals(BYPASS.get());
    }


    public static void set(UUID farmId, UUID userId) {
        FARM_ID.set(farmId);
        USER_ID.set(userId);
    }

    public static UUID getFarmId() { return FARM_ID.get(); }
    public static UUID getUserId() { return USER_ID.get(); }

    public static boolean hasUser() {
        return USER_ID.get() != null;
    }

    public static boolean hasFarm() {
        return FARM_ID.get() != null;
    }
    public static void clear() {
        FARM_ID.remove();
        USER_ID.remove();
        BYPASS.remove();
    }
}