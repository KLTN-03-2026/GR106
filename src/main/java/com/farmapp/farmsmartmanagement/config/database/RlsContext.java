package com.farmapp.farmsmartmanagement.config.database;

import java.util.UUID;

public final class RlsContext {

    private static final ThreadLocal<UUID> FARM_ID = new ThreadLocal<>();
    private static final ThreadLocal<UUID> USER_ID = new ThreadLocal<>();

    private RlsContext() {}

    public static void set(UUID farmId, UUID userId) {
        FARM_ID.set(farmId);
        USER_ID.set(userId);
    }

    public static UUID getFarmId() { return FARM_ID.get(); }
    public static UUID getUserId() { return USER_ID.get(); }

    public static boolean isPresent() { return FARM_ID.get() != null; }

    public static void clear() {
        FARM_ID.remove();
        USER_ID.remove();
    }
}